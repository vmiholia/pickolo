import axios from 'axios';

const API_URL = 'http://localhost:8000';

const getApi = () => {
  return axios.create({
    baseURL: API_URL,
  });
};

export const SkillLevel = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert"
} as const;
export type SkillLevel = typeof SkillLevel[keyof typeof SkillLevel];

export const UserRole = {
  PLAYER: "Player",
  MANAGER: "Manager"
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  display_name?: string;
  role: UserRole;
  skill_level?: SkillLevel;
  points?: number;
  wins?: number;
  losses?: number;
}

export interface Facility {
  id: number;
  name: string;
  manager_id: string;
  instagram_handle?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  currency?: string;
}

export interface Court {
  id: number;
  name: string;
  facility_id: number;
}

export interface Game {
  id: number;
  title: string;
  facility_id: number;
  court_id?: number;
  start_time: string;
  max_players: number;
  skill_level: SkillLevel;
  score_team_a?: number;
  score_team_b?: number;
  is_finished?: boolean;
}

export interface Booking {
  id: number;
  court_id: number;
  user_id: string;
  start_time: string;
}

export interface UserSchedule {
  bookings: Booking[];
  games: Game[];
}

export const login = (userId: string) => getApi().post<User>(`/login?user_id=${userId}`);
export const updateUser = (userId: string, data: Partial<User>) => getApi().put<User>(`/users/${userId}`, data);
export const getUserSchedule = (userId: string) => getApi().get<UserSchedule>(`/users/${userId}/schedule`);

export const getFacilities = (search?: string) => getApi().get<Facility[]>('/facilities', { params: { search } });
export const getFacility = (facilityId: number) => getApi().get<Facility>(`/facilities/${facilityId}`);
export const updateFacility = (facilityId: number, data: Partial<Facility>) => getApi().put<Facility>(`/facilities/${facilityId}`, data);
export const getCourts = (facilityId: number) => getApi().get<Court[]>(`/facilities/${facilityId}/courts`);
export const createCourt = (name: string, facilityId: number) => getApi().post<Court>('/courts', { name, facility_id: facilityId });

export const getBookings = (facilityId: number, date: string) => getApi().get<Booking[]>(`/facilities/${facilityId}/bookings`, { params: { date } });
export const createBooking = (courtId: number, userId: string, startTime: string) => getApi().post<Booking>('/bookings', { court_id: courtId, user_id: userId, start_time: startTime });
export const deleteBooking = (bookingId: number) => getApi().delete(`/bookings/${bookingId}`);

export const getGames = (skillLevel?: SkillLevel) => getApi().get<Game[]>('/games', { params: { skill_level: skillLevel } });
export const createGame = (game: Omit<Game, 'id'>) => getApi().post<Game>('/games', game);
export const deleteGame = (gameId: number) => getApi().delete(`/games/${gameId}`);
export const updateGameScore = (gameId: number, scoreA: number, scoreB: number) => getApi().put(`/games/${gameId}/score`, { score_team_a: scoreA, score_team_b: scoreB });
export const joinGame = (gameId: number, userId: string) => getApi().post(`/games/${gameId}/join?user_id=${userId}`);
export const leaveGame = (gameId: number, userId: string) => getApi().delete(`/games/${gameId}/leave?user_id=${userId}`);
export const getParticipants = (gameId: number) => getApi().get<User[]>(`/games/${gameId}/participants`);

export const getLeaderboard = () => getApi().get<User[]>('/leaderboard');

export default getApi();
