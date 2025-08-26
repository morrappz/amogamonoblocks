import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

const colorPalette = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
];

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const PieChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => Object.values(item)[0]),
    datasets: [
      {
        data: data.map((item) => Object.values(item)[1]),
        backgroundColor: colorPalette,
      },
    ],
  };

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
