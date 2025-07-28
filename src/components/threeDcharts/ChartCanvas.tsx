import * as echarts from 'echarts';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const ChartCanvas = forwardRef<HTMLCanvasElement>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => canvasRef.current!, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = echarts.init(canvasRef.current, undefined, {
      renderer: 'canvas',
    });

chart.setOption({
  backgroundColor: 'rgba(255, 255, 255, 0.2)', // ✅ translucent white background
  series: [
    {
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 200,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 30,
          color: [
            [0.33, '#7aeb7a'],
            [0.66, '#2c778f'],
            [1, '#263c7c'],
          ],
        },
      },
      pointer: {
        itemStyle: {
          color: '#fff',
        },
      },
      axisTick: {
        show: true,
        distance: -25,
        length: 15,
        lineStyle: {
          color: '#ccc',
          width: 2,
        },
      },
      splitLine: {
        show: true,
        distance: -30,
        length: 22,
        lineStyle: {
          color: '#999',
          width: 4,
        },
      },
      axisLabel: {
        distance: -40,
        color: '#ccc',
        fontSize: 16, 
        fontWeight: 'bold',
      },
      title: {
        show: true,
        offsetCenter: [0, '-40%'],
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ccc',
      },
      detail: {
        valueAnimation: true,
        fontSize: 36,
        offsetCenter: [0, '20%'],
        formatter: '{value}',
        color: '#fff',
        fontWeight: 'bold',
      },
      data: [
        {
          value: 124,
          name: 'Pressure Meter',
        },
      ],
    },
  ],
});

    return () => chart.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={1024}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
        display: 'none',
      }}
    />
  );
});

export default ChartCanvas;
