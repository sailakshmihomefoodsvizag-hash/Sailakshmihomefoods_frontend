const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-soft">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-2.5 sm:p-3 lg:p-4 space-y-2">
        <div className="h-3.5 sm:h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3.5 sm:h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCard;

