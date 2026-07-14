import { useRef, useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    review: 'The mango pickle is absolutely authentic! Reminds me of my grandmother\'s homemade pickle. Fresh ingredients and perfect spice balance.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    review: 'Best quality pickles I\'ve ever ordered online. The packaging was excellent and the taste is phenomenal. Highly recommended!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Lakshmi Menon',
    review: 'Authentic taste that takes me back home. The Gongura pickle is my favorite. Will definitely order again!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Arjun Reddy',
    review: 'Amazing quality and traditional preparation. The sweets are fresh and delicious. Great service and fast delivery!',
    rating: 5,
  },
  {
    id: 5,
    name: 'Kavya Iyer',
    review: 'Fantastic products! The podis are aromatic and flavorful. Perfect for our daily breakfast. Thank you Sai Lakshmi!',
    rating: 5,
  },
];

const Testimonials = () => {
  const sliderRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);

  const updateCenterIndex = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const scrollLeft = slider.scrollLeft;
      const cardWidth = slider.scrollWidth / testimonials.length;
      const viewportCenter = scrollLeft + slider.clientWidth / 2;
      const newCenterIndex = Math.floor(viewportCenter / cardWidth);
      setCenterIndex(Math.min(Math.max(newCenterIndex, 0), testimonials.length - 1));
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', updateCenterIndex);
      updateCenterIndex();
      return () => slider.removeEventListener('scroll', updateCenterIndex);
    }
  }, []);

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-gradient-to-b from-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-rubik font-bold text-[28px] sm:text-[32px] lg:text-[33px] text-primary mb-3">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 font-montserrat text-sm sm:text-base max-w-2xl mx-auto">
            Don't just take our word for it — hear from our happy customers
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-6 pt-4 px-4 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] snap-center"
              >
                <div
                  className={`bg-white rounded-2xl lg:rounded-3xl shadow-soft p-6 h-full transition-all duration-500 ease-out ${
                    index === centerIndex
                      ? 'scale-105 -translate-y-2 shadow-lg'
                      : 'scale-95 translate-y-0 opacity-90'
                  }`}
                >
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 font-montserrat text-sm sm:text-base leading-relaxed mb-6 line-clamp-4">
                    "{testimonial.review}"
                  </p>

                  {/* Customer Name */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-rubik font-semibold text-gray-800 text-base sm:text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 font-montserrat text-xs sm:text-sm mt-1">
                      Verified Customer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (sliderRef.current) {
                    const cardWidth = sliderRef.current.scrollWidth / testimonials.length;
                    sliderRef.current.scrollTo({
                      left: cardWidth * index,
                      behavior: 'smooth',
                    });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  centerIndex === index
                    ? 'bg-primary w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
