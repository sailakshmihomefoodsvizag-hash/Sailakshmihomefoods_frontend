const TopBanner = () => {
  const whatsappUrl = 'https://wa.me/919966539144';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-gradient-to-r from-primary via-primary to-primary hover:from-primary-dark hover:via-primary-dark hover:to-primary-dark transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <p className="text-sm sm:text-base font-medium text-center text-white font-montserrat leading-relaxed">
          For international orders{' '}
          <span className="underline decoration-white/80 underline-offset-2 hover:decoration-white transition-all duration-200 font-semibold">
            click here
          </span>
        </p>
      </div>
    </a>
  );
};

export default TopBanner;
