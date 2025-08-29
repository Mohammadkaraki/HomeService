import React from 'react';
import Link from 'next/link';

interface CleaningCardProps {
  services: Array<{
    _id: string;
    name: string;
  }>;
  title: string;
  description: string;
  categoryId: string;
}

const CleaningCard: React.FC<CleaningCardProps> = ({ services, title, description, categoryId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 h-full flex flex-col justify-between">
      <div>
        <Link 
          href={`/services?category=${categoryId}`}
          className="text-green-600 font-medium mb-3 block hover:text-green-700 hover:underline"
        >
          <h3>{title}</h3>
        </Link>
        <p className="text-gray-600 mb-4">{description}</p>
        <ul className="space-y-2">
          {services.map((service, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gray-600 mr-2">•</span>
              <Link 
                href={`/services?category=${categoryId}&subcategory=${service._id}`}
                className="text-gray-600 hover:text-green-600 hover:underline"
              >
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link 
        href={`/category/${categoryId}`}
        className="mt-4 flex items-center text-green-500 hover:text-green-700"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
        View Category
      </Link>
    </div>
  );
};

export default CleaningCard;
