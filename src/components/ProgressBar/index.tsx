export default function ProgressBar() {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-gray-400 h-2.5 rounded-full"
        style={{ width: "45%" }}
      ></div>
    </div>
  );
}
