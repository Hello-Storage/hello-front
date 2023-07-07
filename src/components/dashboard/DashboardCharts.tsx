import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, CartesianGrid, ResponsiveContainer, LabelProps, Cell, Pie, PieChart } from 'recharts';

type StorageData = {
  used: number | null,
  available: number | null,
}

export const StorageBarChart: React.FC<StorageData> = ({ used, available }) => {

  const dataUsage = [
    {
      name: 'Data usage',
      Used: used,
      Available: available,
    },
  ];

  const renderCustomizedLabel: React.FC<LabelProps> = ({ x, y, width, value }) => {
    const radius = 0;

    if (!x || !y || !value || !width) {
      return null;
    }
    const numericX = typeof x === "number" ? x : parseFloat(x);
    const numericY = typeof y === "number" ? y : parseFloat(y);
    const numericWidth = typeof width === "number" ? width : parseFloat(width);

    return (
      <text x={numericX + numericWidth + radius} y={numericY + (numericY < 20 ? -7 : 15)} fill="#8884d8">
        {`${value}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart layout="vertical" data={dataUsage} margin={{ top: 15, right: 75, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Used" stackId="a" fill="#000008">
          <LabelList dataKey="Used" content={renderCustomizedLabel} />
        </Bar>
        <Bar dataKey="Available" stackId="a" fill="#82ca9d">
          <LabelList dataKey="Available" content={renderCustomizedLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};





//file types can be:
/*
photos
videos
documents
music
presentations
spreadsheets
pdfs
compressedfiles
codeefiles
other
*/





const data01 = [
  { name: 'Photos', value: 30 },
  { name: 'Videos', value: 70 },
];

const COLORS = ['#8883d8', '#82ca9d'];


interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: CustomizedLabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="gray" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export const UsedStoragePieChart = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data01}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={renderCustomizedLabel}
        >
          {
            data01.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
          }
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>)
}