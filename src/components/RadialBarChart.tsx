import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
    {
        name: 'Total',
        Used: 70,
        Available: 30,
    },
];

interface propTypes {
        x: number;
        y: number;
        width: number;
        value: number;
} 

const CustomBarChart = () => {
    const renderCustomizedLabel = (props: propTypes) => {
        const { x = 0, y = 0, width = 0, value } = props;
        const radius = 10;

        return (
            <text x={x + width + radius} y={y + (y < 20 ? -7 : 15)} fill="#8884d8">
                {`${value}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width={300} height={100}>
            <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 15, right: 40, left: 20, bottom: 5 }}
            >
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

export default CustomBarChart;