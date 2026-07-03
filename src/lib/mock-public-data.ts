import type { AirQualityReading, AwsObservation, TrafficLink, WeatherForecast, WildfireReport, EarthquakeEvent } from '@/types/public-data';

function gradeFromPm25(pm25: number): AirQualityReading['grade'] {
  if (pm25 <= 15) return 'good';
  if (pm25 <= 35) return 'moderate';
  if (pm25 <= 75) return 'unhealthy';
  if (pm25 <= 150) return 'very_unhealthy';
  return 'hazardous';
}

export const MOCK_AIR_QUALITY: AirQualityReading[] = [
  // Seoul 25 districts
  { id: 'aq-001', name: '종로구', lat: 37.572, lng: 126.979, pm25: 18, pm10: 42, o3: 0.034, no2: 0.031, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-002', name: '중구', lat: 37.5641, lng: 126.9979, pm25: 21, pm10: 47, o3: 0.031, no2: 0.034, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-003', name: '용산구', lat: 37.532, lng: 126.990, pm25: 15, pm10: 35, o3: 0.037, no2: 0.028, co: 0.4, so2: 0.003, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-004', name: '성동구', lat: 37.5634, lng: 127.0371, pm25: 23, pm10: 49, o3: 0.029, no2: 0.036, co: 0.6, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-005', name: '광진구', lat: 37.5385, lng: 127.0823, pm25: 19, pm10: 43, o3: 0.033, no2: 0.030, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-006', name: '동대문구', lat: 37.5744, lng: 127.0396, pm25: 25, pm10: 53, o3: 0.027, no2: 0.038, co: 0.6, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-007', name: '중랑구', lat: 37.6063, lng: 127.0927, pm25: 17, pm10: 40, o3: 0.035, no2: 0.029, co: 0.4, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-008', name: '성북구', lat: 37.5894, lng: 127.0167, pm25: 14, pm10: 33, o3: 0.039, no2: 0.026, co: 0.4, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-009', name: '강북구', lat: 37.6396, lng: 127.0257, pm25: 11, pm10: 27, o3: 0.044, no2: 0.021, co: 0.3, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-010', name: '도봉구', lat: 37.6688, lng: 127.0471, pm25: 10, pm10: 24, o3: 0.046, no2: 0.019, co: 0.3, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-011', name: '노원구', lat: 37.654, lng: 127.056, pm25: 9, pm10: 22, o3: 0.048, no2: 0.018, co: 0.3, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-012', name: '은평구', lat: 37.6027, lng: 126.9291, pm25: 13, pm10: 31, o3: 0.040, no2: 0.024, co: 0.4, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-013', name: '서대문구', lat: 37.5791, lng: 126.9368, pm25: 16, pm10: 37, o3: 0.036, no2: 0.027, co: 0.4, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-014', name: '마포구', lat: 37.566, lng: 126.901, pm25: 12, pm10: 28, o3: 0.041, no2: 0.025, co: 0.4, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-015', name: '양천구', lat: 37.5170, lng: 126.8664, pm25: 29, pm10: 61, o3: 0.024, no2: 0.041, co: 0.7, so2: 0.005, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-016', name: '강서구', lat: 37.5509, lng: 126.8495, pm25: 33, pm10: 68, o3: 0.021, no2: 0.043, co: 0.7, so2: 0.005, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-017', name: '구로구', lat: 37.495, lng: 126.858, pm25: 38, pm10: 72, o3: 0.019, no2: 0.045, co: 0.8, so2: 0.006, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-018', name: '금천구', lat: 37.4569, lng: 126.8956, pm25: 41, pm10: 78, o3: 0.017, no2: 0.048, co: 0.8, so2: 0.007, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-019', name: '영등포구', lat: 37.526, lng: 126.896, pm25: 31, pm10: 65, o3: 0.022, no2: 0.042, co: 0.7, so2: 0.005, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-020', name: '동작구', lat: 37.5124, lng: 126.9393, pm25: 22, pm10: 48, o3: 0.030, no2: 0.034, co: 0.6, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-021', name: '관악구', lat: 37.4784, lng: 126.9516, pm25: 20, pm10: 45, o3: 0.032, no2: 0.032, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-022', name: '서초구', lat: 37.484, lng: 127.032, pm25: 20, pm10: 45, o3: 0.032, no2: 0.033, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-023', name: '강남구', lat: 37.518, lng: 127.047, pm25: 24, pm10: 51, o3: 0.028, no2: 0.038, co: 0.6, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-024', name: '송파구', lat: 37.515, lng: 127.106, pm25: 27, pm10: 58, o3: 0.030, no2: 0.035, co: 0.6, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-025', name: '강동구', lat: 37.5301, lng: 127.1238, pm25: 19, pm10: 43, o3: 0.034, no2: 0.030, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  // 인천
  { id: 'aq-026', name: '인천 남동구', lat: 37.449, lng: 126.731, pm25: 42, pm10: 85, o3: 0.015, no2: 0.052, co: 0.9, so2: 0.008, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-027', name: '인천 부평구', lat: 37.5074, lng: 126.7218, pm25: 47, pm10: 92, o3: 0.013, no2: 0.055, co: 1.0, so2: 0.009, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-028', name: '인천 연수구', lat: 37.4106, lng: 126.6784, pm25: 35, pm10: 70, o3: 0.020, no2: 0.046, co: 0.8, so2: 0.006, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  // 경기
  { id: 'aq-029', name: '수원 장안구', lat: 37.303, lng: 127.010, pm25: 22, pm10: 48, o3: 0.030, no2: 0.030, co: 0.5, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-030', name: '성남 분당구', lat: 37.382, lng: 127.119, pm25: 16, pm10: 36, o3: 0.035, no2: 0.026, co: 0.4, so2: 0.002, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-031', name: '고양 일산동구', lat: 37.6584, lng: 126.7749, pm25: 26, pm10: 55, o3: 0.028, no2: 0.037, co: 0.6, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-032', name: '용인 수지구', lat: 37.3220, lng: 127.0975, pm25: 14, pm10: 32, o3: 0.039, no2: 0.025, co: 0.4, so2: 0.002, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-033', name: '부천 원미구', lat: 37.5035, lng: 126.7660, pm25: 44, pm10: 88, o3: 0.014, no2: 0.053, co: 0.9, so2: 0.008, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-034', name: '안산 단원구', lat: 37.3197, lng: 126.8093, pm25: 49, pm10: 95, o3: 0.012, no2: 0.058, co: 1.0, so2: 0.010, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-035', name: '안양 동안구', lat: 37.3925, lng: 126.9518, pm25: 28, pm10: 60, o3: 0.026, no2: 0.039, co: 0.6, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  // 광역시
  { id: 'aq-036', name: '대전 유성구', lat: 36.3624, lng: 127.3565, pm25: 17, pm10: 39, o3: 0.035, no2: 0.028, co: 0.4, so2: 0.003, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-037', name: '대구 수성구', lat: 35.8583, lng: 128.6303, pm25: 30, pm10: 62, o3: 0.023, no2: 0.040, co: 0.7, so2: 0.005, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-038', name: '부산 해운대구', lat: 35.1631, lng: 129.1636, pm25: 13, pm10: 30, o3: 0.042, no2: 0.024, co: 0.4, so2: 0.003, grade: 'good', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-039', name: '광주 서구', lat: 35.1519, lng: 126.8896, pm25: 21, pm10: 46, o3: 0.031, no2: 0.033, co: 0.5, so2: 0.004, grade: 'moderate', dataTime: '2026-07-03T14:00:00' },
  { id: 'aq-040', name: '울산 남구', lat: 35.5439, lng: 129.3300, pm25: 46, pm10: 90, o3: 0.013, no2: 0.056, co: 1.1, so2: 0.012, grade: 'unhealthy', dataTime: '2026-07-03T14:00:00' },
].map((s) => ({ ...s, grade: gradeFromPm25(s.pm25 ?? 0) }));

export const MOCK_AWS_STATIONS: AwsObservation[] = [
  // 17 시/도 대표 지점
  { id: 'aws-108', name: '서울', lat: 37.5714, lng: 126.9658, temp: 28.3, humidity: 72, windSpeed: 2.1, windDirection: 225, rainfall1h: 0, pressure: 1008.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-112', name: '인천', lat: 37.4775, lng: 126.6247, temp: 27.1, humidity: 78, windSpeed: 3.5, windDirection: 270, rainfall1h: 0, pressure: 1009.1, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-119', name: '수원', lat: 37.2900, lng: 126.9836, temp: 29.0, humidity: 68, windSpeed: 1.8, windDirection: 180, rainfall1h: 0, pressure: 1007.8, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-133', name: '대전', lat: 36.3722, lng: 127.3725, temp: 31.2, humidity: 62, windSpeed: 1.2, windDirection: 135, rainfall1h: 0, pressure: 1006.5, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-143', name: '대구', lat: 35.8850, lng: 128.6186, temp: 33.1, humidity: 55, windSpeed: 0.8, windDirection: 90, rainfall1h: 0, pressure: 1005.9, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-152', name: '울산', lat: 35.5600, lng: 129.3200, temp: 30.5, humidity: 70, windSpeed: 2.4, windDirection: 135, rainfall1h: 0, pressure: 1006.8, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-156', name: '광주', lat: 35.1728, lng: 126.8914, temp: 30.8, humidity: 65, windSpeed: 1.5, windDirection: 200, rainfall1h: 0.5, pressure: 1007.1, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-159', name: '부산', lat: 35.1047, lng: 129.0322, temp: 28.9, humidity: 75, windSpeed: 3.2, windDirection: 180, rainfall1h: 0, pressure: 1007.5, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-131', name: '청주', lat: 36.6392, lng: 127.4407, temp: 32.0, humidity: 60, windSpeed: 1.1, windDirection: 135, rainfall1h: 0, pressure: 1006.1, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-146', name: '전주', lat: 35.8219, lng: 127.1547, temp: 31.5, humidity: 63, windSpeed: 1.3, windDirection: 180, rainfall1h: 0, pressure: 1006.3, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-232', name: '춘천', lat: 37.9025, lng: 127.7361, temp: 30.0, humidity: 60, windSpeed: 1.0, windDirection: 135, rainfall1h: 0, pressure: 1006.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-184', name: '제주', lat: 33.5142, lng: 126.5297, temp: 27.5, humidity: 82, windSpeed: 4.1, windDirection: 225, rainfall1h: 1.2, pressure: 1009.5, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-236', name: '홍성(내포)', lat: 36.6577, lng: 126.6706, temp: 30.6, humidity: 66, windSpeed: 1.6, windDirection: 225, rainfall1h: 0, pressure: 1007.3, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-192', name: '진주', lat: 35.1636, lng: 128.0400, temp: 32.4, humidity: 58, windSpeed: 1.0, windDirection: 180, rainfall1h: 0, pressure: 1005.7, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-105', name: '강릉', lat: 37.7514, lng: 128.8911, temp: 26.8, humidity: 80, windSpeed: 2.8, windDirection: 45, rainfall1h: 0, pressure: 1008.8, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-140', name: '군산', lat: 36.0053, lng: 126.7614, temp: 28.7, humidity: 79, windSpeed: 3.8, windDirection: 270, rainfall1h: 0, pressure: 1008.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-165', name: '목포', lat: 34.8168, lng: 126.3814, temp: 29.4, humidity: 77, windSpeed: 3.3, windDirection: 225, rainfall1h: 0, pressure: 1008.0, observedAt: '2026-07-03T14:00:00' },
  // 경기/수도권 도시
  { id: 'aws-101', name: '고양', lat: 37.6584, lng: 126.8320, temp: 28.1, humidity: 71, windSpeed: 2.0, windDirection: 225, rainfall1h: 0, pressure: 1008.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-102', name: '성남', lat: 37.4200, lng: 127.1267, temp: 28.8, humidity: 67, windSpeed: 1.5, windDirection: 180, rainfall1h: 0, pressure: 1007.6, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-103', name: '용인', lat: 37.2411, lng: 127.1776, temp: 29.5, humidity: 64, windSpeed: 1.3, windDirection: 135, rainfall1h: 0, pressure: 1007.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-104', name: '부천', lat: 37.5035, lng: 126.7660, temp: 28.4, humidity: 73, windSpeed: 2.3, windDirection: 270, rainfall1h: 0, pressure: 1008.6, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-106', name: '안산', lat: 37.3219, lng: 126.8309, temp: 28.6, humidity: 76, windSpeed: 3.0, windDirection: 270, rainfall1h: 0, pressure: 1008.5, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-107', name: '안양', lat: 37.3943, lng: 126.9568, temp: 29.1, humidity: 66, windSpeed: 1.6, windDirection: 180, rainfall1h: 0, pressure: 1007.7, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-109', name: '평택', lat: 36.9922, lng: 127.1128, temp: 30.2, humidity: 69, windSpeed: 1.9, windDirection: 225, rainfall1h: 0, pressure: 1007.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-110', name: '의정부', lat: 37.7381, lng: 127.0338, temp: 27.9, humidity: 70, windSpeed: 1.4, windDirection: 135, rainfall1h: 0, pressure: 1008.1, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-111', name: '파주', lat: 37.7599, lng: 126.7799, temp: 27.6, humidity: 74, windSpeed: 2.2, windDirection: 225, rainfall1h: 0, pressure: 1008.5, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-113', name: '김포', lat: 37.6152, lng: 126.7156, temp: 28.0, humidity: 75, windSpeed: 2.9, windDirection: 270, rainfall1h: 0, pressure: 1008.7, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-114', name: '광명', lat: 37.4786, lng: 126.8646, temp: 28.9, humidity: 68, windSpeed: 1.7, windDirection: 180, rainfall1h: 0, pressure: 1007.9, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-115', name: '남양주', lat: 37.6360, lng: 127.2165, temp: 28.2, humidity: 69, windSpeed: 1.2, windDirection: 135, rainfall1h: 0, pressure: 1007.8, observedAt: '2026-07-03T14:00:00' },
  // 강원 (산간/해안)
  { id: 'aws-100', name: '대관령', lat: 37.6771, lng: 128.7183, temp: 21.4, humidity: 88, windSpeed: 5.2, windDirection: 315, rainfall1h: 2.8, pressure: 1011.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-114', name: '원주', lat: 37.3376, lng: 127.9466, temp: 30.7, humidity: 61, windSpeed: 1.1, windDirection: 135, rainfall1h: 0, pressure: 1006.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-130', name: '속초', lat: 38.2070, lng: 128.5918, temp: 26.5, humidity: 81, windSpeed: 3.4, windDirection: 45, rainfall1h: 0.3, pressure: 1009.0, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-211', name: '인제', lat: 38.0597, lng: 128.1707, temp: 29.3, humidity: 72, windSpeed: 1.5, windDirection: 315, rainfall1h: 0.8, pressure: 1007.0, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-217', name: '태백', lat: 37.1706, lng: 128.9895, temp: 23.9, humidity: 84, windSpeed: 3.9, windDirection: 315, rainfall1h: 1.5, pressure: 1010.1, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-212', name: '홍천', lat: 37.6832, lng: 127.8807, temp: 30.9, humidity: 63, windSpeed: 1.0, windDirection: 135, rainfall1h: 0, pressure: 1006.6, observedAt: '2026-07-03T14:00:00' },
  // 충청
  { id: 'aws-129', name: '서산', lat: 36.7766, lng: 126.4938, temp: 28.5, humidity: 78, windSpeed: 3.6, windDirection: 270, rainfall1h: 0, pressure: 1008.6, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-135', name: '추풍령', lat: 36.2203, lng: 128.0224, temp: 29.8, humidity: 67, windSpeed: 2.1, windDirection: 225, rainfall1h: 0, pressure: 1006.9, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-232b', name: '천안', lat: 36.8151, lng: 127.1139, temp: 31.0, humidity: 64, windSpeed: 1.4, windDirection: 180, rainfall1h: 0, pressure: 1006.7, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-127', name: '충주', lat: 36.9702, lng: 127.9526, temp: 31.6, humidity: 59, windSpeed: 1.2, windDirection: 135, rainfall1h: 0, pressure: 1006.0, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-177', name: '보령', lat: 36.3327, lng: 126.5599, temp: 28.9, humidity: 80, windSpeed: 3.7, windDirection: 270, rainfall1h: 0, pressure: 1008.3, observedAt: '2026-07-03T14:00:00' },
  // 전라
  { id: 'aws-247', name: '남원', lat: 35.4164, lng: 127.3906, temp: 31.3, humidity: 66, windSpeed: 1.1, windDirection: 180, rainfall1h: 0, pressure: 1006.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-243', name: '부안', lat: 35.7297, lng: 126.7167, temp: 29.0, humidity: 79, windSpeed: 3.5, windDirection: 270, rainfall1h: 0, pressure: 1008.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-165b', name: '여수', lat: 34.7392, lng: 127.7405, temp: 28.6, humidity: 81, windSpeed: 4.0, windDirection: 225, rainfall1h: 0.4, pressure: 1008.1, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-256', name: '순천', lat: 34.9506, lng: 127.4874, temp: 30.4, humidity: 72, windSpeed: 1.6, windDirection: 180, rainfall1h: 0, pressure: 1007.0, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-260', name: '장흥', lat: 34.6815, lng: 126.9198, temp: 30.1, humidity: 74, windSpeed: 1.8, windDirection: 225, rainfall1h: 0, pressure: 1007.2, observedAt: '2026-07-03T14:00:00' },
  // 경상
  { id: 'aws-136', name: '안동', lat: 36.5729, lng: 128.7071, temp: 32.7, humidity: 56, windSpeed: 0.9, windDirection: 90, rainfall1h: 0, pressure: 1005.6, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-137', name: '상주', lat: 36.4108, lng: 128.1580, temp: 33.4, humidity: 54, windSpeed: 0.7, windDirection: 90, rainfall1h: 0, pressure: 1005.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-138', name: '포항', lat: 36.0322, lng: 129.3800, temp: 29.7, humidity: 71, windSpeed: 3.1, windDirection: 45, rainfall1h: 0, pressure: 1007.3, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-155', name: '창원', lat: 35.1701, lng: 128.5730, temp: 30.9, humidity: 68, windSpeed: 1.7, windDirection: 180, rainfall1h: 0, pressure: 1006.6, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-162', name: '통영', lat: 34.8455, lng: 128.4356, temp: 28.4, humidity: 80, windSpeed: 3.9, windDirection: 225, rainfall1h: 0, pressure: 1008.0, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-168', name: '거제', lat: 34.8880, lng: 128.6206, temp: 28.7, humidity: 82, windSpeed: 4.2, windDirection: 225, rainfall1h: 0.6, pressure: 1008.2, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-279', name: '구미', lat: 36.1303, lng: 128.3446, temp: 33.3, humidity: 55, windSpeed: 0.8, windDirection: 90, rainfall1h: 0, pressure: 1005.5, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-283', name: '경주', lat: 35.8562, lng: 129.2247, temp: 31.8, humidity: 63, windSpeed: 1.9, windDirection: 135, rainfall1h: 0, pressure: 1006.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-271', name: '봉화', lat: 36.9433, lng: 128.9147, temp: 28.8, humidity: 75, windSpeed: 1.3, windDirection: 315, rainfall1h: 0.5, pressure: 1007.5, observedAt: '2026-07-03T14:00:00' },
  // 도서 (섬)
  { id: 'aws-115b', name: '울릉도', lat: 37.4812, lng: 130.8986, temp: 25.9, humidity: 85, windSpeed: 4.8, windDirection: 45, rainfall1h: 1.8, pressure: 1009.8, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-102b', name: '백령도', lat: 37.9720, lng: 124.6300, temp: 26.4, humidity: 83, windSpeed: 5.1, windDirection: 270, rainfall1h: 0, pressure: 1009.6, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-185', name: '고산(제주)', lat: 33.2938, lng: 126.1628, temp: 27.8, humidity: 84, windSpeed: 5.5, windDirection: 225, rainfall1h: 0.9, pressure: 1009.7, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-189', name: '서귀포', lat: 33.2464, lng: 126.5657, temp: 28.2, humidity: 83, windSpeed: 3.6, windDirection: 225, rainfall1h: 2.1, pressure: 1009.4, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-201', name: '강화', lat: 37.7076, lng: 126.4460, temp: 27.4, humidity: 77, windSpeed: 3.0, windDirection: 270, rainfall1h: 0, pressure: 1008.9, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-295', name: '완도', lat: 34.3956, lng: 126.7013, temp: 29.1, humidity: 81, windSpeed: 4.3, windDirection: 225, rainfall1h: 0.7, pressure: 1008.3, observedAt: '2026-07-03T14:00:00' },
  { id: 'aws-294', name: '진도', lat: 34.4728, lng: 126.2622, temp: 29.3, humidity: 80, windSpeed: 4.5, windDirection: 225, rainfall1h: 0, pressure: 1008.2, observedAt: '2026-07-03T14:00:00' },
];

export const MOCK_TRAFFIC_LINKS: TrafficLink[] = [
  // 종로 (서대문→동대문, 동서방향, lat~37.571)
  { linkId: 'TL-001', speed: 35, travelTime: 240, congestion: 'slow', coordinates: [[126.966, 37.572], [126.971, 37.572], [126.977, 37.572], [126.983, 37.571], [126.989, 37.571], [126.997, 37.571], [127.005, 37.571], [127.010, 37.571]] },
  // 을지로 (시청→을지로4가, lat~37.566)
  { linkId: 'TL-002', speed: 28, travelTime: 300, congestion: 'slow', coordinates: [[126.978, 37.566], [126.984, 37.566], [126.990, 37.566], [126.997, 37.567], [127.003, 37.567], [127.009, 37.567]] },
  // 세종대로 (광화문→서울역, 남북방향, lng~126.977)
  { linkId: 'TL-003', speed: 42, travelTime: 180, congestion: 'smooth', coordinates: [[126.977, 37.576], [126.977, 37.572], [126.978, 37.568], [126.978, 37.564], [126.977, 37.560], [126.975, 37.556], [126.973, 37.554]] },
  // 퇴계로 (서울역→동대입구, lat~37.558)
  { linkId: 'TL-004', speed: 18, travelTime: 420, congestion: 'congested', coordinates: [[126.972, 37.556], [126.978, 37.558], [126.985, 37.559], [126.991, 37.559], [126.997, 37.559], [127.004, 37.559], [127.009, 37.558]] },
  // 테헤란로 (강남역→삼성역, lat~37.504-37.509)
  { linkId: 'TL-005', speed: 12, travelTime: 540, congestion: 'congested', coordinates: [[127.028, 37.498], [127.033, 37.500], [127.038, 37.501], [127.043, 37.502], [127.049, 37.504], [127.055, 37.506], [127.060, 37.508], [127.064, 37.509]] },
  // 강남대로 (신논현→양재, lng~127.027-127.035)
  { linkId: 'TL-006', speed: 22, travelTime: 380, congestion: 'slow', coordinates: [[127.025, 37.504], [127.026, 37.500], [127.027, 37.497], [127.028, 37.493], [127.030, 37.490], [127.032, 37.486], [127.034, 37.483]] },
  // 반포대로 (고속터미널→반포, lng~127.002)
  { linkId: 'TL-007', speed: 48, travelTime: 160, congestion: 'smooth', coordinates: [[127.002, 37.505], [127.002, 37.501], [127.002, 37.497], [127.001, 37.493], [127.001, 37.490]] },
  // 강변북로 서쪽 (마포→여의도앞, 한강 북안 lat~37.539-37.544)
  { linkId: 'TL-008', speed: 55, travelTime: 140, congestion: 'smooth', coordinates: [[126.910, 37.547], [126.920, 37.545], [126.930, 37.544], [126.942, 37.543], [126.953, 37.541], [126.964, 37.539]] },
  // 강변북로 중앙 (한남대교~잠실, 한강 북안 lat~37.533-37.539)
  { linkId: 'TL-009', speed: 32, travelTime: 280, congestion: 'slow', coordinates: [[126.998, 37.536], [127.010, 37.534], [127.020, 37.533], [127.034, 37.531], [127.048, 37.530], [127.063, 37.530], [127.076, 37.530]] },
  // 올림픽대로 서쪽 (여의도~반포, 한강 남안 lat~37.517-37.522)
  { linkId: 'TL-010', speed: 65, travelTime: 100, congestion: 'smooth', coordinates: [[126.918, 37.522], [126.932, 37.521], [126.946, 37.520], [126.960, 37.518], [126.974, 37.517], [126.988, 37.516]] },
  // 올림픽대로 동쪽 (반포~잠실, 한강 남안 lat~37.512-37.517)
  { linkId: 'TL-011', speed: 8, travelTime: 700, congestion: 'congested', coordinates: [[126.988, 37.516], [127.002, 37.515], [127.016, 37.515], [127.030, 37.514], [127.048, 37.514], [127.064, 37.516], [127.080, 37.517]] },
  // 내부순환로 북측 (홍제~월곡, lat~37.594-37.607)
  { linkId: 'TL-012', speed: 58, travelTime: 130, congestion: 'smooth', coordinates: [[126.940, 37.594], [126.953, 37.598], [126.966, 37.600], [126.980, 37.603], [126.993, 37.605], [127.006, 37.607]] },
  // 내부순환로 동측 (월곡→마장, lng~127.03-127.04)
  { linkId: 'TL-013', speed: 40, travelTime: 200, congestion: 'slow', coordinates: [[127.030, 37.604], [127.033, 37.597], [127.035, 37.590], [127.038, 37.583], [127.039, 37.576], [127.040, 37.569]] },
  // 동부간선도로 (성수→수서, lng~127.056, 한강 남쪽)
  { linkId: 'TL-014', speed: 45, travelTime: 170, congestion: 'smooth', coordinates: [[127.056, 37.510], [127.058, 37.504], [127.060, 37.498], [127.062, 37.492], [127.064, 37.487], [127.066, 37.480]] },
  // 동일로 (동대문→미아, 남북, lng~127.010-127.020)
  { linkId: 'TL-015', speed: 25, travelTime: 320, congestion: 'slow', coordinates: [[127.009, 37.571], [127.012, 37.577], [127.015, 37.583], [127.017, 37.590], [127.019, 37.596], [127.020, 37.602]] },
  // 남부순환로 서쪽 (사당→서초, lat~37.484)
  { linkId: 'TL-016', speed: 15, travelTime: 500, congestion: 'congested', coordinates: [[126.982, 37.484], [126.991, 37.484], [127.001, 37.484], [127.010, 37.484], [127.020, 37.484], [127.030, 37.484]] },
  // 남부순환로 동쪽 (서초→개포, lat~37.484-37.485)
  { linkId: 'TL-017', speed: 38, travelTime: 210, congestion: 'slow', coordinates: [[127.030, 37.484], [127.038, 37.484], [127.047, 37.484], [127.055, 37.485], [127.063, 37.485], [127.070, 37.485]] },
  // 경부고속도로 (양재IC~판교, 한강 남쪽)
  { linkId: 'TL-018', speed: 85, travelTime: 90, congestion: 'smooth', coordinates: [[127.035, 37.483], [127.038, 37.473], [127.043, 37.462], [127.048, 37.450], [127.055, 37.438], [127.060, 37.425]] },
  // 서부간선도로 (영등포→금천, lng~126.895)
  { linkId: 'TL-019', speed: 20, travelTime: 400, congestion: 'slow', coordinates: [[126.895, 37.510], [126.895, 37.503], [126.895, 37.496], [126.894, 37.489], [126.894, 37.482], [126.893, 37.475]] },
  // 의주로-통일로 (서울역→독립문, lng~126.967-126.970)
  { linkId: 'TL-020', speed: 50, travelTime: 150, congestion: 'smooth', coordinates: [[126.972, 37.554], [126.969, 37.560], [126.967, 37.566], [126.966, 37.572], [126.964, 37.578], [126.963, 37.584]] },
  // 송파대로 (잠실→문정, lng~127.105-127.112)
  { linkId: 'TL-021', speed: 30, travelTime: 260, congestion: 'slow', coordinates: [[127.105, 37.514], [127.106, 37.508], [127.107, 37.502], [127.108, 37.496], [127.110, 37.490], [127.112, 37.485]] },
  // 천호대로 (광진→강동, lat~37.538-37.540)
  { linkId: 'TL-022', speed: 55, travelTime: 135, congestion: 'smooth', coordinates: [[127.078, 37.538], [127.087, 37.539], [127.096, 37.539], [127.106, 37.540], [127.116, 37.540], [127.126, 37.540]] },
  // 도산대로 (압구정→대치, lat~37.520→37.498)
  { linkId: 'TL-023', speed: 10, travelTime: 600, congestion: 'congested', coordinates: [[127.030, 37.520], [127.035, 37.516], [127.040, 37.512], [127.045, 37.508], [127.050, 37.504], [127.054, 37.500]] },
  // 노들로-한강대로 (한강대교→용산역, 한강 위 다리+남북)
  { linkId: 'TL-024', speed: 42, travelTime: 180, congestion: 'smooth', coordinates: [[126.963, 37.515], [126.963, 37.520], [126.965, 37.526], [126.967, 37.532], [126.968, 37.538], [126.969, 37.544]] },
  // 시흥대로 (금천→구로, lat~37.468-37.478)
  { linkId: 'TL-025', speed: 33, travelTime: 240, congestion: 'slow', coordinates: [[126.884, 37.478], [126.886, 37.475], [126.888, 37.472], [126.890, 37.470], [126.893, 37.468], [126.897, 37.466]] },
];

export function trafficToGeoJSON(links: TrafficLink[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: links.map((l) => ({
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: l.coordinates },
      properties: {
        linkId: l.linkId,
        speed: l.speed,
        congestion: l.congestion,
        travelTime: l.travelTime,
      },
    })),
  };
}

export function airQualityToGeoJSON(readings: AirQualityReading[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: readings.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id,
        name: r.name,
        pm25: r.pm25,
        pm10: r.pm10,
        grade: r.grade,
        dataTime: r.dataTime,
      },
    })),
  };
}

export function awsToGeoJSON(stations: AwsObservation[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stations.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: {
        id: s.id,
        name: s.name,
        temp: s.temp,
        humidity: s.humidity,
        windSpeed: s.windSpeed,
        rainfall1h: s.rainfall1h,
        observedAt: s.observedAt,
      },
    })),
  };
}

export const MOCK_WEATHER_FORECAST: WeatherForecast[] = [
  { id: 'wf-001', name: '서울', lat: 37.5665, lng: 126.9780, temperature: 29, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 72, windSpeed: 2.3, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-002', name: '인천', lat: 37.4563, lng: 126.7052, temperature: 27, sky: 'cloudy', precipitation: 'none', precipAmount: 0, humidity: 78, windSpeed: 3.8, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-003', name: '수원', lat: 37.2636, lng: 127.0286, temperature: 30, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 68, windSpeed: 1.9, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-004', name: '춘천', lat: 37.8813, lng: 127.7300, temperature: 31, sky: 'clear', precipitation: 'none', precipAmount: 0, humidity: 58, windSpeed: 1.2, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-005', name: '강릉', lat: 37.7519, lng: 128.8761, temperature: 27, sky: 'overcast', precipitation: 'rain', precipAmount: 2.5, humidity: 85, windSpeed: 3.1, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-006', name: '대전', lat: 36.3504, lng: 127.3845, temperature: 32, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 62, windSpeed: 1.4, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-007', name: '청주', lat: 36.6424, lng: 127.4890, temperature: 33, sky: 'clear', precipitation: 'none', precipAmount: 0, humidity: 58, windSpeed: 1.0, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-008', name: '대구', lat: 35.8714, lng: 128.6014, temperature: 34, sky: 'clear', precipitation: 'none', precipAmount: 0, humidity: 52, windSpeed: 0.9, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-009', name: '부산', lat: 35.1796, lng: 129.0756, temperature: 28, sky: 'cloudy', precipitation: 'shower', precipAmount: 5.0, humidity: 80, windSpeed: 3.5, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-010', name: '울산', lat: 35.5384, lng: 129.3114, temperature: 30, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 70, windSpeed: 2.6, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-011', name: '광주', lat: 35.1595, lng: 126.8526, temperature: 31, sky: 'cloudy', precipitation: 'rain', precipAmount: 8.0, humidity: 78, windSpeed: 1.8, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-012', name: '전주', lat: 35.8242, lng: 127.1480, temperature: 32, sky: 'overcast', precipitation: 'rain', precipAmount: 12.0, humidity: 82, windSpeed: 2.0, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-013', name: '제주', lat: 33.4996, lng: 126.5312, temperature: 28, sky: 'overcast', precipitation: 'rain', precipAmount: 15.0, humidity: 88, windSpeed: 5.2, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-014', name: '서귀포', lat: 33.2541, lng: 126.5600, temperature: 29, sky: 'cloudy', precipitation: 'shower', precipAmount: 3.0, humidity: 84, windSpeed: 4.1, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-015', name: '속초', lat: 38.2070, lng: 128.5918, temperature: 26, sky: 'overcast', precipitation: 'rain', precipAmount: 6.0, humidity: 86, windSpeed: 3.6, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-016', name: '원주', lat: 37.3422, lng: 127.9201, temperature: 31, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 63, windSpeed: 1.3, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-017', name: '포항', lat: 36.0190, lng: 129.3435, temperature: 29, sky: 'cloudy', precipitation: 'none', precipAmount: 0, humidity: 74, windSpeed: 2.8, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-018', name: '목포', lat: 34.8118, lng: 126.3922, temperature: 29, sky: 'overcast', precipitation: 'rain', precipAmount: 10.0, humidity: 85, windSpeed: 4.5, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-019', name: '여수', lat: 34.7604, lng: 127.6622, temperature: 28, sky: 'cloudy', precipitation: 'shower', precipAmount: 4.0, humidity: 82, windSpeed: 3.9, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-020', name: '안동', lat: 36.5684, lng: 128.7294, temperature: 33, sky: 'clear', precipitation: 'none', precipAmount: 0, humidity: 55, windSpeed: 0.8, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-021', name: '진주', lat: 35.1800, lng: 128.1076, temperature: 32, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 60, windSpeed: 1.1, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-022', name: '천안', lat: 36.8151, lng: 127.1139, temperature: 31, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 65, windSpeed: 1.5, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-023', name: '군산', lat: 35.9676, lng: 126.7369, temperature: 28, sky: 'overcast', precipitation: 'rain', precipAmount: 7.0, humidity: 83, windSpeed: 4.0, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-024', name: '홍성', lat: 36.6011, lng: 126.6603, temperature: 30, sky: 'cloudy', precipitation: 'none', precipAmount: 0, humidity: 70, windSpeed: 2.2, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-025', name: '태백', lat: 37.1648, lng: 128.9855, temperature: 24, sky: 'overcast', precipitation: 'rain', precipAmount: 4.0, humidity: 87, windSpeed: 3.4, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-026', name: '고양', lat: 37.6584, lng: 126.8320, temperature: 28, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 71, windSpeed: 2.1, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-027', name: '성남', lat: 37.4200, lng: 127.1267, temperature: 29, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 67, windSpeed: 1.6, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-028', name: '용인', lat: 37.2411, lng: 127.1776, temperature: 30, sky: 'clear', precipitation: 'none', precipAmount: 0, humidity: 64, windSpeed: 1.3, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-029', name: '창원', lat: 35.2280, lng: 128.6811, temperature: 31, sky: 'partly_cloudy', precipitation: 'none', precipAmount: 0, humidity: 68, windSpeed: 1.8, forecastTime: '2026-07-03T15:00:00' },
  { id: 'wf-030', name: '경주', lat: 35.8562, lng: 129.2247, temperature: 32, sky: 'clear', precipitation: 'none', precipAmount: 0, humidity: 60, windSpeed: 1.5, forecastTime: '2026-07-03T15:00:00' },
];

export const MOCK_WILDFIRE_REPORTS: WildfireReport[] = [
  { id: 'wf-fire-001', name: '강원 양양 산불', lat: 38.0755, lng: 128.6186, status: 'active', affectedArea: 85, startedAt: '2026-07-02T14:30:00', description: '양양군 서면 일대 산림 화재. 소방헬기 4대 투입, 주민 대피 완료.' },
  { id: 'wf-fire-002', name: '경북 울진 산불', lat: 36.9931, lng: 129.4005, status: 'active', affectedArea: 210, startedAt: '2026-07-01T11:20:00', description: '울진군 북면 산림 대형 화재. 특별재난지역 선포 검토 중.' },
  { id: 'wf-fire-003', name: '충남 보령 산불', lat: 36.3327, lng: 126.6130, status: 'contained', affectedArea: 12, startedAt: '2026-07-02T16:45:00', description: '보령시 청라면 야산 화재. 진화율 85%, 잔불 정리 중.' },
  { id: 'wf-fire-004', name: '경남 밀양 산불', lat: 35.5037, lng: 128.7486, status: 'extinguished', affectedArea: 5, startedAt: '2026-07-01T09:10:00', description: '밀양시 상남면 소규모 산불. 당일 완전 진화.' },
  { id: 'wf-fire-005', name: '강원 삼척 산불', lat: 37.4500, lng: 129.1652, status: 'active', affectedArea: 150, startedAt: '2026-07-02T08:00:00', description: '삼척시 근덕면 해안 인접 산림 화재. 강풍으로 확산 우려.' },
  { id: 'wf-fire-006', name: '전남 해남 산불', lat: 34.5736, lng: 126.5990, status: 'contained', affectedArea: 28, startedAt: '2026-07-02T13:20:00', description: '해남군 삼산면 산림 화재. 진화율 92%.' },
  { id: 'wf-fire-007', name: '경북 안동 산불', lat: 36.5684, lng: 128.7294, status: 'extinguished', affectedArea: 8, startedAt: '2026-06-30T15:40:00', description: '안동시 와룡면 소규모 화재. 조기 발견으로 신속 진화.' },
  { id: 'wf-fire-008', name: '강원 정선 산불', lat: 37.3807, lng: 128.6610, status: 'active', affectedArea: 45, startedAt: '2026-07-03T06:15:00', description: '정선군 임계면 고지대 산불. 접근 곤란으로 헬기 집중 투입.' },
];

export const MOCK_EARTHQUAKE_EVENTS: EarthquakeEvent[] = [
  { id: 'eq-001', lat: 35.7649, lng: 129.1900, magnitude: 3.8, depth: 12, location: '경북 경주시 남남서쪽 8km', occurredAt: '2026-07-03T02:14:32', maxIntensity: 4 },
  { id: 'eq-002', lat: 36.1090, lng: 129.3700, magnitude: 2.5, depth: 8, location: '경북 포항시 북구 북쪽 11km', occurredAt: '2026-07-02T18:45:11', maxIntensity: 2 },
  { id: 'eq-003', lat: 35.1500, lng: 129.0800, magnitude: 2.1, depth: 15, location: '부산 해운대구 동쪽 해역 6km', occurredAt: '2026-07-02T09:22:05', maxIntensity: 1 },
  { id: 'eq-004', lat: 33.5200, lng: 126.2500, magnitude: 3.2, depth: 18, location: '제주특별자치도 서쪽 해역 32km', occurredAt: '2026-07-01T14:08:47', maxIntensity: 3 },
  { id: 'eq-005', lat: 36.7700, lng: 126.9200, magnitude: 2.8, depth: 10, location: '충남 홍성군 북쪽 5km', occurredAt: '2026-07-01T06:33:19', maxIntensity: 3 },
  { id: 'eq-006', lat: 38.2100, lng: 128.0500, magnitude: 2.3, depth: 20, location: '강원 인제군 북서쪽 14km', occurredAt: '2026-06-30T22:17:55', maxIntensity: 2 },
  { id: 'eq-007', lat: 35.8800, lng: 129.7500, magnitude: 4.1, depth: 9, location: '경북 경주시 동쪽 해역 45km', occurredAt: '2026-06-29T11:52:30', maxIntensity: 5 },
  { id: 'eq-008', lat: 34.3000, lng: 127.5800, magnitude: 2.0, depth: 22, location: '전남 여수시 남쪽 해역 18km', occurredAt: '2026-06-28T03:41:08', maxIntensity: 1 },
];

export function weatherForecastToGeoJSON(forecasts: WeatherForecast[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: forecasts.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: {
        id: f.id,
        name: f.name,
        temperature: f.temperature,
        sky: f.sky,
        precipitation: f.precipitation,
        precipAmount: f.precipAmount,
        humidity: f.humidity,
        windSpeed: f.windSpeed,
        forecastTime: f.forecastTime,
      },
    })),
  };
}

export function wildfireToGeoJSON(reports: WildfireReport[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: reports.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id,
        name: r.name,
        status: r.status,
        affectedArea: r.affectedArea,
        startedAt: r.startedAt,
        description: r.description,
      },
    })),
  };
}

export function earthquakeToGeoJSON(events: EarthquakeEvent[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: events.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: {
        id: e.id,
        magnitude: e.magnitude,
        depth: e.depth,
        location: e.location,
        occurredAt: e.occurredAt,
        maxIntensity: e.maxIntensity,
      },
    })),
  };
}
