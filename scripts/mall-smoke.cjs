/* Browser integration checks. Every mall API request is intercepted; no real orders are sent. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MALL_PREVIEW_URL || 'http://localhost:8090';
const output = '.expo/mall-review';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    const requests = [];
    let quantity = 2;
    let failQuantity = false;
    let failSubmit = true;
    let orderExists = true;
    const product = () => ({
      wlbm: 'A002',
      wlmc: '测试商品 A002',
      gystm: 'PRODUCTO DE PRUEBA',
      dj: 12,
      zhj: 10,
      wlsl: quantity,
      jldw_sw: 'Caja',
      zkl_sw: '10%',
      iva_sw: '21%',
      sj: 2.1,
      tsje: 0,
      shj: 12.1,
    });
    const order = {
      xshth: 'TEST-ORDER',
      dp: 'TEST-SHOP',
      kh_sw: '测试客户',
      khsh: 'TEST-NIF',
      jezj: 24.2,
      khdz: '测试地址',
      dq: 'Barcelona',
      yb: '08001',
      pcczsj: '2026-09-12',
      bz: '',
      lsdz: '',
      bhshj: 20,
      sjhj: 4.2,
    };
    const cart = () => ({
      xsddList: orderExists ? [order] : [],
      xsddmxList: orderExists ? [{ ...product(), bh: 1, sl: quantity }] : [],
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/xcx/**', async (route) => {
      const endpoint = new URL(route.request().url()).pathname;
      const body = route.request().postDataJSON();
      requests.push({ endpoint, body });
      let data = {};
      let success = true;
      let message = '';
      switch (endpoint) {
        case '/xcx/Authorize/Login':
          data = { Token: 'test-token', UserId: 'TEST-SHOP' };
          break;
        case '/xcx/Yw/Cxsy':
          data = {
            cpbqsyList: [
              {
                bm: 'TAG',
                cpbq: '测试标签',
                cpxxsyList: [product(), { ...product(), wlbm: 'A003' }],
              },
            ],
          };
          break;
        case '/xcx/Yw/Cxall':
          data = { cpdlList: [{ bm: 'CAT', cpdl: '食品' }] };
          break;
        case '/xcx/Yw/Cxdl':
          data = { cpbqList: [{ bm: 'TAG', cpbq: '测试标签' }] };
          break;
        case '/xcx/Yw/Cxbq':
        case '/xcx/Yw/Cxsx':
          data = {
            cpxxList:
              body.qswz === 0
                ? [product()]
                : body.qswz === 1
                  ? [{ ...product(), wlbm: 'A004', wlmc: '第二页商品' }]
                  : [],
          };
          break;
        case '/xcx/Yw/Cpxq':
          data = { cpxxList: [product()] };
          break;
        case '/xcx/Yw/Ddzr':
        case '/xcx/Yw/Ddck':
          data = cart();
          break;
        case '/xcx/Yw/Ddlb':
          data = { xsddList: [order] };
          break;
        case '/xcx/Yw/Dpxx':
          data = {
            khdpList: [
              {
                dpbm: 'TEST-SHOP',
                khmc: '测试客户',
                sh: 'TEST-NIF',
                dpmc: '测试店铺',
                dpdh: '123456789',
                dpdzyx: 'test@example.com',
                dpdz: '测试地址',
                djrq: '2026-01-01',
                zhxdrq: '2026-09-12',
              },
            ],
          };
          break;
        case '/xcx/Yw/Ddjia':
        case '/xcx/Yw/Ddjian':
        case '/xcx/Yw/Ddtiao':
          if (failQuantity) {
            success = false;
            message = '测试数量更新失败';
          } else {
            quantity = endpoint.endsWith('Ddjia')
              ? quantity + 1
              : endpoint.endsWith('Ddjian')
                ? quantity - 1
                : body.xsddList[0].wlsl;
          }
          data = cart();
          break;
        case '/xcx/Yw/Ddxg':
          Object.assign(order, body.xsddList[0]);
          data = cart();
          break;
        case '/xcx/Yw/Ddtj':
          if (failSubmit) {
            success = false;
            message = '测试提交失败';
          } else orderExists = false;
          break;
        case '/xcx/Authorize/RestPassword':
          break;
        default:
          throw new Error(`Unexpected endpoint: ${endpoint}`);
      }
      await route.fulfill({
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({
          Success: success,
          Message: message,
          Data: { Data: data },
        }),
      });
    });
    const visible = async (text) =>
      page
        .getByText(text, { exact: true })
        .filter({ visible: true })
        .first()
        .waitFor({ state: 'visible', timeout: 30000 });
    const snapshot = async (name) => {
      await page.screenshot({ path: `${output}/${name}.png` });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth
        ),
        false,
        `${name}: horizontal overflow`
      );
    };
    const go = async (path, text) => {
      await page.goto(base + path, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      });
      await visible(text);
    };
    await go('/pages/login', '欢迎回来');
    await page.getByRole('button', { name: /登 录/ }).click();
    await visible('请输入账号和密码');
    await snapshot('login');
    await page.getByText('账号注册 / Registro de cuenta').click();
    await visible('账号注册');
    await page.getByRole('button', { name: /提交/ }).click();
    await visible('请填写客户名称、税号、电话和邮箱');
    await snapshot('register');

    // The legacy deep link must survive authentication and retain the product id.
    await go('/sub-pages/product/goods-detail/index?id=A002', '欢迎回来');
    await page.getByLabel('请输入账号', { exact: true }).fill('test-user');
    await page.getByLabel('请输入密码', { exact: true }).fill('test-password');
    await page.getByRole('checkbox').last().click();
    await page.getByRole('button', { name: /登 录/ }).click();
    await visible('测试商品 A002');
    assert(page.url().includes('id=A002'), 'Product deep link lost its id');
    await snapshot('detail');
    await page.getByLabel('增加数量', { exact: true }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('input[aria-label="商品数量"]')?.value === '3'
    );
    failQuantity = true;
    await page.getByLabel('增加数量', { exact: true }).click();
    await visible('测试数量更新失败');
    assert.equal(await page.getByLabel('商品数量').inputValue(), '3');
    failQuantity = false;

    await go('/pages/home/index', '首页 (Inicio)');
    await visible('测试商品 A002');
    await snapshot('home');
    assert.equal(await page.getByRole('tab').count(), 4);
    await page.getByLabel('搜索商品', { exact: true }).fill('A002');
    await page.getByLabel('搜索商品', { exact: true }).press('Enter');
    await visible('搜索：A002');
    await visible('测试商品 A002');
    await page.getByText('加载更多 / Cargar más', { exact: true }).click();
    await visible('第二页商品');
    assert(
      requests.some(
        (entry) => entry.endpoint.endsWith('Cxsx') && entry.body.qswz === 1
      )
    );
    assert(
      requests.some(
        (entry) => entry.endpoint.endsWith('Cxsx') && entry.body.cpsx === 'A002'
      )
    );
    await go('/pages/product/category/index', '分类 (Categorías)');
    await visible('测试标签');
    await snapshot('category');
    await page.getByText('测试标签', { exact: true }).click();
    await visible('测试商品 A002');
    await page.getByText('加载更多 / Cargar más', { exact: true }).click();
    await visible('第二页商品');
    assert(
      requests.some(
        (entry) => entry.endpoint.endsWith('Cxbq') && entry.body.qswz === 1
      )
    );

    await go('/pages/user/shopping-cart/index', '订单 (Carrito)');
    await visible('测试客户');
    await page.getByLabel('临时送货地址').fill('临时测试地址');
    await page.getByLabel('订单备注').fill('测试备注');
    await page.getByText('查看更多订单信息 ›', { exact: true }).click();
    await visible('税前合计');
    await snapshot('cart');
    // dispatchEvent deliberately leaves the input focused, like a native submit tap.
    const submitsBefore = requests.filter((entry) =>
      entry.endpoint.endsWith('Ddtj')
    ).length;
    failQuantity = true;
    await page.getByLabel('商品数量', { exact: true }).fill('7');
    await page.getByRole('button', { name: /提交订单/ }).dispatchEvent('click');
    await visible('测试数量更新失败');
    assert.equal(
      requests.filter((entry) => entry.endpoint.endsWith('Ddtj')).length,
      submitsBefore
    );
    failQuantity = false;
    await page.getByLabel('商品数量', { exact: true }).fill('7');
    await page.getByRole('button', { name: /提交订单/ }).dispatchEvent('click');
    await visible('测试提交失败');
    assert.equal(
      quantity,
      7,
      'Submit did not flush the still-focused quantity input'
    );
    assert.equal(order.lsdz, '临时测试地址');
    assert.equal(order.bz, '测试备注');
    failSubmit = false;
    await page.getByRole('button', { name: /提交订单/ }).click();
    await visible('订单列表 (Lista de pedidos)');
    await visible('TEST-ORDER');
    await snapshot('orders');

    await go('/pages/user/user-center/index', '我的 (Mi cuenta)');
    await visible('测试客户');
    await snapshot('profile');
    await page.getByRole('button', { name: /修改密码/ }).click();
    await visible('Modificación de contraseña');
    await page.getByLabel('输入旧密码', { exact: true }).fill('old-password');
    await page.getByLabel('输入新密码', { exact: true }).fill('new-password');
    await page
      .getByLabel('确认新密码', { exact: true })
      .fill('different-password');
    await page.getByRole('button', { name: /确认修改/ }).click();
    await visible('两次输入的密码不一致');
    await snapshot('password');
    await page.getByLabel('确认新密码', { exact: true }).fill('new-password');
    await page.getByRole('button', { name: /确认修改/ }).click();
    await visible('欢迎回来');
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('mall-session')).token
      ),
      ''
    );
    await page.goto(base + '/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('account-input').waitFor({ state: 'visible' });
    assert.equal(
      new URL(page.url()).pathname,
      '/login',
      'Legacy login was redirected to the mall'
    );
    assert.deepEqual(errors, [], 'Browser runtime errors');
    console.log(
      'PASS: 9 pages, legacy links, authentication, search, category navigation, quantities and rollback, address saving, submit failure/success, password validation and logout.'
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
