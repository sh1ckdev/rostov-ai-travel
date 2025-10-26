// Типы для API моделей на основе OpenAPI документации

// ===== AUTH TYPES =====
export interface RegisterModel {
  login: string;
  password: string;
  confirmPassword: string;
  email?: string;
  fullName?: string;
}

export interface LoginModel {
  username: string;
  password: string;
}

export interface LoginResponseModel {
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpires: string;
  username?: string;
}

export interface TokenModel {
  accessToken: string;
  refreshToken: string;
}

// ===== COMMON TYPES =====
export interface TimeOnly {
  hour: number;
  minute: number;
  second?: number;
  millisecond?: number;
  microsecond?: number;
  nanosecond?: number;
  ticks?: number;
}

export interface DateOnly {
  year: number;
  month: number;
  day: number;
  dayOfWeek: DayOfWeek;
  dayOfYear?: number;
  dayNumber?: number;
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

// ===== EVENT TYPES =====
export interface CreateEventDto {
  name: string;
  description?: string;
  datetimeOpen?: TimeOnly;
  datetimeClose?: TimeOnly;
  cost?: string;
  adress?: string;
  contacts?: string;
  ageLimit?: number;
}

export interface UpdateEventDto {
  name: string;
  description?: string;
  datetimeOpen?: TimeOnly;
  datetimeClose?: TimeOnly;
  cost?: string;
  adress?: string;
  contacts?: string;
  ageLimit?: number;
  isAvalible?: boolean;
}

export interface EventDto {
  id: number;
  name?: string;
  description?: string;
  datetimeOpen?: TimeOnly;
  datetimeClose?: TimeOnly;
  cost?: string;
  adress?: string;
  contacts?: string;
  isAvalible: boolean;
  ageLimit: number;
}

export interface EventCategoryDto {
  name?: string;
  count: number;
}

export interface EventBookingDto {
  eventId: number;
  ticketsCount: number;
  bookingDate: string; // ISO date-time string
  notes?: string;
}

export interface BookingResponseDto {
  bookingId?: string;
  eventId: number;
  eventName?: string;
  userId: number;
  ticketsCount: number;
  bookingDate: string; // ISO date-time string
  status?: string;
  notes?: string;
  createdAt: string; // ISO date-time string
}

export interface UpdateBookingDto {
  ticketsCount?: number;
  bookingDate?: string; // ISO date-time string
  notes?: string;
}

// ===== HOTEL TYPES =====
export interface CreateHotelDto {
  name: string;
  description?: string;
  daytimeOpen?: TimeOnly;
  daytimeClose?: TimeOnly;
  cost?: string;
  adress?: string;
  contacts?: string;
}

export interface UpdateHotelDto {
  name: string;
  description?: string;
  daytimeOpen?: TimeOnly;
  daytimeClose?: TimeOnly;
  cost?: string;
  adress?: string;
  contacts?: string;
  isAvalible?: boolean;
}

export interface HotelDto {
  id: number;
  name?: string;
  description?: string;
  daytimeOpen?: TimeOnly;
  daytimeClose?: TimeOnly;
  cost?: string;
  adress?: string;
  contacts?: string;
  isAvalible: boolean;
}

export interface HotelBookingDto {
  hotelId: number;
  checkInDate: string; // ISO date-time string
  checkOutDate: string; // ISO date-time string
  notes?: string;
}

export interface CreateReviewDto {
  description: string;
}

export interface HotelReviewDto {
  id: number;
  hotelId: number;
  userId: number;
  userName?: string;
  description?: string;
  date: string; // ISO date-time string
}

// ===== AI SERVICE TYPES =====
export interface ApiResponse {
  response?: string;
}

export interface StartChatUserRequest {
  location?: string;
}

export interface ChatMessageRequest {
  sessionId?: string;
  message?: string;
}

export interface MessageDto {
  role?: string;
  content?: string;
  timestamp: string; // ISO date-time string
}

export interface ChatResponse {
  sessionId?: string;
  response?: string;
  fullHistory?: MessageDto[];
}

// ===== WEATHER TYPES =====
export interface WeatherForecast {
  date: DateOnly;
  temperatureC: number;
  temperatureF?: number;
  summary?: string;
}

// ===== API RESPONSE TYPES =====
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: ProblemDetails;
}

// ===== USER TYPES =====
export interface UserDto {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== QUERY PARAMETERS =====
export interface EventsQueryParams {
  Filters?: string;
  Sorts?: string;
  Page?: number;
  PageSize?: number;
}

export interface HotelsQueryParams {
  Filters?: string;
  Sorts?: string;
  Page?: number;
  PageSize?: number;
}

export interface HotelAvailabilityParams {
  hotelId?: number;
  checkIn?: string; // ISO date-time string
  checkOut?: string; // ISO date-time string
}

export interface SearchParams {
  query?: string;
}

export interface HotelRecommendationParams {
  location?: string;
}
