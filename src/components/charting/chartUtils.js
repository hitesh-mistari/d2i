import { predefinedPalettes } from '@/config/colorPalettes';

export const generateChartData = (tableData, chartConfig, brandConfig) => {
  const { xAxis, yAxes, chartType } = chartConfig;
  const { chartColorPalette } = brandConfig;

  if (!tableData || !tableData.rawData || !xAxis || !yAxes || yAxes.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = tableData.rawData.map(row => row[xAxis]);
  
  let palette;
  if (chartColorPalette?.type === 'custom' && Array.isArray(chartColorPalette.colors)) {
    palette = chartColorPalette.colors;
  } else {
    palette = predefinedPalettes[chartColorPalette?.key || 'default'] || predefinedPalettes.default;
  }

  const datasets = yAxes.map((yAxisKey, index) => {
    const data = tableData.rawData.map(row => parseFloat(row[yAxisKey]) || 0);
    const color = palette[index % palette.length];
    
    let datasetOptions = {
      label: yAxisKey,
      data: data,
      backgroundColor: color,
      borderColor: color,
      borderWidth: chartType === 'line' ? 2 : 1,
      fill: chartType === 'line' ? false : true,
      tension: chartType === 'line' ? 0.3 : undefined,
      pointRadius: chartType === 'line' ? 3 : undefined,
      pointBackgroundColor: chartType === 'line' ? color : undefined,
    };

    if (chartType === 'pie') {
      datasetOptions.backgroundColor = labels.map((_, i) => palette[i % palette.length]);
      datasetOptions.borderColor = labels.map((_, i) => palette[i % palette.length]);
    }
    
    return datasetOptions;
  });

  return { labels, datasets };
};

export const generateChartOptions = (chartConfig, brandConfig, chartData) => {
  const { chartTitle, description, yAxisLabel, chartType, showLegend } = chartConfig;
  const { 
    font, 
    fontWeight, 
    titlePlacement, 
    titleColor, 
    titleAlignment, 
    legendColor, 
    showGridLines,
    axisTickColor,
    axisLabelColor,
  } = brandConfig;

  const baseFontFamily = `"${font || 'Poppins'}", sans-serif`;

  const getActualAlignment = (align) => {
    switch (align) {
      case 'center': return 'center';
      case 'right': return 'end';
      case 'left':
      default: return 'start';
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: (titlePlacement === 'top' || titlePlacement === 'center') && chartTitle ? 5 : 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    plugins: {
      legend: {
        display: showLegend && chartType !== 'pie' && chartData.datasets.length > 1,
        position: 'top',
        labels: {
          color: legendColor || '#333333',
          font: {
            family: baseFontFamily,
            weight: fontWeight || 'normal',
            size: 12,
          },
          padding: 10,
          boxWidth: 12,
          usePointStyle: true,
        }
      },
      title: {
        display: !!chartTitle && titlePlacement !== 'none',
        text: chartTitle,
        color: titleColor || '#333333',
        align: getActualAlignment(titleAlignment),
        position: titlePlacement === 'bottom' ? 'bottom' : 'top',
        font: {
          family: baseFontFamily,
          size: 18,
          weight: 'bold',
        },
        padding: { 
          top: (titlePlacement === 'top' || titlePlacement === 'center') ? 15 : 5, 
          bottom: (titlePlacement === 'bottom' ? 15 : (description && titlePlacement !== 'bottom' ? 2 : 15))
        }
      },
      subtitle: {
        display: !!description && titlePlacement !== 'none',
        text: description,
        color: titleColor ? titleColor.replace(')', ', 0.8)').replace('rgb', 'rgba') : '#555555',
        align: getActualAlignment(titleAlignment),
        position: titlePlacement === 'bottom' ? 'bottom' : 'top',
        font: {
          family: baseFontFamily,
          size: 12,
          style: 'italic',
          weight: fontWeight || 'normal',
        },
        padding: { 
          top: (titlePlacement === 'bottom' || !chartTitle) ? 0 : 0,
          bottom: titlePlacement === 'bottom' ? 5 : 15 
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { family: baseFontFamily, weight: 'bold' },
        bodyFont: { family: baseFontFamily },
        footerFont: { family: baseFontFamily },
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        display: chartType !== 'pie',
        grid: {
          display: showGridLines,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: axisTickColor || '#666666',
          font: {
            family: baseFontFamily,
            weight: fontWeight || 'normal',
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: !!chartConfig.xAxis,
          text: chartConfig.xAxis,
          color: axisLabelColor || '#555555',
          font: {
            family: baseFontFamily,
            size: 13,
            weight: '500', 
          },
          padding: { top: 10 }
        }
      },
      y: {
        display: chartType !== 'pie',
        grid: {
          display: showGridLines,
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          color: axisTickColor || '#666666',
          font: {
            family: baseFontFamily,
            weight: fontWeight || 'normal',
            size: 11,
          },
          padding: 5,
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: axisLabelColor || '#555555',
          font: {
            family: baseFontFamily,
            size: 13,
            weight: '500',
          },
          padding: { bottom: 10 }
        }
      }
    }
  };

  if (chartType === 'pie') {
    options.plugins.legend.display = showLegend;
    options.plugins.legend.position = 'right';
    options.scales = {}; // No scales for pie charts
  }

  return options;
};
