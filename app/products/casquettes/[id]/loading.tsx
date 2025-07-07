export default function CasquetteDetailLoading() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url('https://res.cloudinary.com/deh3ejeph/image/upload/v1750722801/new_photo_uetrbs.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#1C1C1C",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>

      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-white text-lg">جاري تحميل تفاصيل المنتج...</p>
      </div>
    </div>
  )
}
