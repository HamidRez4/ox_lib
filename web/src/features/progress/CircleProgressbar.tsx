import React from 'react';
import { createStyles, RingProgress, Stack, Text, useMantineTheme } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import type { CircleProgressbarProps } from '../../typings';

const useStyles = createStyles((theme, params: { position: 'middle' | 'bottom' }) => ({
  container: {
    width: '100%',
    height: params.position === 'middle' ? '100%' : '20%',
    bottom: 0,
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    '> svg > circle:nth-child(1)': {
      stroke: theme.colors.dark[5],
    },
  },
  value: {
    textAlign: 'center',
    fontFamily: 'Vazirmatn',
    textShadow: theme.shadows.sm,
    color: theme.colors.gray[3],
  },
  label: {
    textAlign: 'center',
    textShadow: theme.shadows.sm,
    color: theme.colors.gray[3],
    height: 25,
  },
  wrapper: {
    marginTop: params.position === 'middle' ? 25 : undefined,
  },
}));

const CircleProgressbar: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [progressDuration, setProgressDuration] = React.useState(0);
  const [position, setPosition] = React.useState<'middle' | 'bottom'>('middle');
  const [value, setValue] = React.useState(0);
  const [label, setLabel] = React.useState('');
  const theme = useMantineTheme();
  const { classes } = useStyles({ position });

  useNuiEvent('progressCancel', () => {
    setValue(99);
    setVisible(false);
  });

  useNuiEvent<CircleProgressbarProps>('circleProgress', (data) => {
    if (visible) return;
    setVisible(true);
    setValue(0);
    setLabel(data.label || '');
    setProgressDuration(data.duration);
    setPosition(data.position || 'middle');

    const startTime = performance.now();

    const update = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const percent = Math.min((elapsed / data.duration) * 100, 100);
      setValue(Math.floor(percent));
      if (percent < 100) {
        requestAnimationFrame(update);
      } else {
        setTimeout(() => {
          setVisible(false);
          fetchNui('progressComplete');
        }, 300);
      }
    };

    requestAnimationFrame(update);
  });

  return (
    <Stack spacing={0} className={classes.container}>
      <ScaleFade visible={visible}>
        <Stack spacing={0} align="center" className={classes.wrapper}>
          <RingProgress
            size={90}
            thickness={7}
            sections={[{ value: value, color: theme.primaryColor }]}
            className={classes.progress}
            label={<Text className={classes.value}>{value}%</Text>}
          />
          {label && <Text className={classes.label}>{label}</Text>}
        </Stack>
      </ScaleFade>
    </Stack>
  );
};

export default CircleProgressbar;
