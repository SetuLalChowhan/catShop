export interface ImageAsset {
  url: string;
  publicId: string;
  alt?: string;
}

export type CatAvailability = "available" | "reserved" | "sold";
export type CatStatus = "active" | "archived";

export interface Cat {
  _id: string;
  name: string;
  slug: string;
  breed: string;
  ageMonths: number;
  gender: "male" | "female";
  description: string;
  shortDescription?: string;
  images: ImageAsset[];
  availability: CatAvailability;
  status: CatStatus;
  isFeatured: boolean;
  traits: string[];
  pedigree?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  cat:
    | string
    | (Pick<Cat, "name" | "slug" | "breed" | "availability"> & { images: ImageAsset[] });
  preferredDate?: string | null;
  message?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Winner {
  _id: string;
  name: string;
  image: ImageAsset | null;
  facebookUrl: string;
  position: number;
  isWinnerOfMonth: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

export type AdminUser = Admin;

export interface ContactInfo {
  phone: string;
  email: string;
  facebook: string;
  messenger: string;
  address: string;
  hours: string;
}

export interface WebsiteContent {
  brand: {
    name: string;
    tagline: string;
    description: string;
    announcementBar: string;
    footerText: string;
    logoImage?: ImageAsset | null;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: ImageAsset | null;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    introTitle: string;
    introText: string;
    catsSectionTitle?: string;
    catsSectionSubtitle?: string;
    winnersSectionTitle?: string;
    winnersSectionSubtitle?: string;
  };
  about: {
    title: string;
    story: string;
    mission: string;
    images: ImageAsset[];
  };
  contact: ContactInfo;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export type ContactMessageStatus = "unread" | "read" | "replied" | "archived";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCats: number;
  availableCats: number;
  reservedCats: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalWinners: number;
  totalContacts?: number;
  unreadContacts?: number;
}
