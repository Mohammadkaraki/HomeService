export interface Review {
    author: string;
    date: string;
    text: string;
  }
  
  export interface Service {
    id: number;
    name: string;
    rating: number;
    reviewCount: number;
    price: number;
    elite: boolean;
    assemblyTasks: number;
    totalAssemblyTasks: number;
    image: string;
    description: string;
    reviews: Review[];
    available: boolean;
  }