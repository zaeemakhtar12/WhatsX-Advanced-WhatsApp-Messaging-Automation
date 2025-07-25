import React, { useState, useEffect } from 'react';

// Simple Line Chart Component
export function LineChart({ data, width = 300, height = 150, color = '#25D366' }) {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = animatedData.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = animatedData.length > 0 ? 
    `0,${height} ${points} ${width},${height}` : '';

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <linearGradient id={`area-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1="0"
            y1={height * ratio}
            x2={width}
            y2={height * ratio}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        {areaPoints && (
          <polygon
            points={areaPoints}
            fill={`url(#area-gradient-${color.replace('#', '')})`}
            className="animate-fade-in"
          />
        )}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-fade-in"
          style={{
            strokeDasharray: points ? '1000' : '0',
            strokeDashoffset: points ? '1000' : '0',
            animation: 'drawLine 2s ease-out forwards'
          }}
        />

        {/* Data points */}
        {animatedData.map((point, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((point.value - minValue) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="animate-bounce-in opacity-0"
              style={{
                animationDelay: `${index * 0.1 + 1}s`,
                animationFillMode: 'forwards'
              }}
            />
          );
        })}
      </svg>

      <style jsx>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Bar Chart Component
export function BarChart({ data, width = 300, height = 150, color = '#25D366' }) {
  const [animatedHeights, setAnimatedHeights] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedHeights(data.map(d => d.value));
    }, 200);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - (data.length - 1) * 8) / data.length;

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        {data.map((item, index) => {
          const barHeight = animatedHeights[index] ? (animatedHeights[index] / maxValue) * height : 0;
          const x = index * (barWidth + 8);
          const y = height - barHeight;

          return (
            <g key={index}>
              {/* Bar background */}
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={height}
                fill="currentColor"
                fillOpacity="0.05"
                rx="4"
              />
              
              {/* Animated bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                className="transition-all duration-1000 ease-out"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              />
              
              {/* Value label */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="12"
                fill="currentColor"
                fillOpacity="0.7"
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1 + 0.5}s`,
                  animationFillMode: 'forwards',
                  opacity: 0
                }}
              >
                {animatedHeights[index] || 0}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Donut Chart Component
export function DonutChart({ 
  data, 
  size = 120, 
  strokeWidth = 12, 
  colors = ['#25D366', '#3B82F6', '#8B5CF6', '#F59E0B'] 
}) {
  const [animatedData, setAnimatedData] = useState([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth={strokeWidth}
        />
        
        {/* Data segments */}
        {animatedData.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
          
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white animate-bounce-in">
            {total}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
        </div>
      </div>
    </div>
  );
}

// Progress Ring Component
export function ProgressRing({ 
  percentage, 
  size = 80, 
  strokeWidth = 8, 
  color = '#25D366',
  backgroundColor = 'currentColor'
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeOpacity="0.1"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {Math.round(animatedPercentage)}%
        </span>
      </div>
    </div>
  );
}

// Stats Card with Chart
export function StatsChartCard({ 
  title, 
  value, 
  change, 
  chartData, 
  chartType = 'line',
  icon,
  color = '#25D366' 
}) {
  const isPositive = change >= 0;
  
  return (
    <div className="stats-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}/10 to-${color}/20 group-hover:from-${color}/20 group-hover:to-${color}/30 transition-all duration-300`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white animate-bounce-in">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none">
            <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {Math.abs(change)}%
        </div>
      </div>
      
      {chartData && (
        <div className="mt-4">
          {chartType === 'line' && (
            <LineChart data={chartData} width={200} height={60} color={color} />
          )}
          {chartType === 'bar' && (
            <BarChart data={chartData} width={200} height={60} color={color} />
          )}
          {chartType === 'progress' && (
            <div className="flex justify-center">
              <ProgressRing percentage={value} color={color} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Activity Timeline Component
export function ActivityTimeline({ activities }) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div 
          key={index} 
          className="flex items-start gap-4 animate-slide-in-left"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className={`w-3 h-3 rounded-full mt-1.5 ${
            activity.type === 'success' ? 'bg-green-500' :
            activity.type === 'warning' ? 'bg-amber-500' :
            activity.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`} />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activity.description}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Metric Comparison Component
export function MetricComparison({ metrics }) {
  return (
    <div className="space-y-4">
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className="animate-slide-in-right"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {metric.label}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                metric.color ? `bg-${metric.color}-500` : 'bg-whatsapp-500'
              }`}
              style={{
                width: `${metric.percentage}%`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Heatmap Component
export function Heatmap({ data, days = 7, hours = 24 }) {
  const maxValue = Math.max(...data.flat());
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-24 gap-1">
        {/* Hour labels */}
        {Array.from({ length: hours }, (_, i) => (
          <div key={i} className="text-xs text-gray-400 text-center">
            {i}
          </div>
        ))}
      </div>
      
      {/* Heatmap grid */}
      <div className="space-y-1">
        {data.map((row, dayIndex) => (
          <div key={dayIndex} className="grid grid-cols-24 gap-1">
            {row.map((value, hourIndex) => {
              const intensity = maxValue > 0 ? value / maxValue : 0;
              return (
                <div
                  key={hourIndex}
                  className={`w-3 h-3 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer`}
                  style={{
                    backgroundColor: `rgba(37, 211, 102, ${intensity})`,
                    animationDelay: `${(dayIndex * hours + hourIndex) * 10}ms`
                  }}
                  title={`Day ${dayIndex + 1}, Hour ${hourIndex}: ${value}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Day labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, days).map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}

export default {
  LineChart,
  BarChart,
  DonutChart,
  ProgressRing,
  StatsChartCard,
  ActivityTimeline,
  MetricComparison,
  Heatmap,
}; 