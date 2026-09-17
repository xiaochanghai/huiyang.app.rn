import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const ChevronLeft = ({
  color = '#52525B',
  width = 24,
  height = 24,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M15 19L8 12L15 5"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
    />
  </Svg>
);
