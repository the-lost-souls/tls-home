export interface CarouselSection {
    image: string;
    title: string;
    year: number;
    event: string;
    category: string;
    ranked: number;
    credits: {
      name: string,
      role: string
    }[];
    links: {
      id: string,
      url: string
    }[];
  }
