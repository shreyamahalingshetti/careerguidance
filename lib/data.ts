// lib/data.ts

// Define the interface for a college object
export interface CollegeData {
  id: number;
  name: string;
  stream: 'Science' | 'Commerce' | 'Arts';
  city: string;
  course: string;
  ranking: number;
  description: string;
}

// Mock Database/Data Source
const MOCK_COLLEGES: CollegeData[] = [
  { id: 1, name: 'Mumbai Tech Institute', stream: 'Science', city: 'Mumbai', course: 'B.Tech', ranking: 5, description: 'Top Engineering College in the West.' },
  { id: 2, name: 'Delhi Commerce School', stream: 'Commerce', city: 'Delhi', course: 'B.Com', ranking: 2, description: 'Known for Finance specialization.' },
  { id: 3, name: 'Pune Arts Academy', stream: 'Arts', city: 'Pune', course: 'B.A.', ranking: 8, description: 'Excellent Liberal Arts program.' },
  { id: 4, name: 'Bangalore Science Hub', stream: 'Science', city: 'Bangalore', course: 'B.Tech', ranking: 1, description: 'Pioneering CS and IT research.' },
  { id: 5, name: 'Mumbai BBA College', stream: 'Commerce', city: 'Mumbai', course: 'BBA', ranking: 4, description: 'Great management programs.' },
  { id: 6, name: 'Delhi Literature College', stream: 'Arts', city: 'Delhi', course: 'B.A.', ranking: 10, description: 'Focus on English and History.' },
  { id: 7, name: 'Pune Medical School', stream: 'Science', city: 'Pune', course: 'M.B.B.S.', ranking: 3, description: 'Premier medical education institute.' },
];

/**
 * Simulates fetching filtered colleges from a database.
 * @param params - The filters from the URL search parameters.
 * @returns A promise that resolves to the filtered list of colleges.
 */
export async function fetchColleges(params: { stream?: string; city?: string; course?: string }): Promise<CollegeData[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300)); 

  let filteredColleges = MOCK_COLLEGES;

  if (params.stream) {
    filteredColleges = filteredColleges.filter(c => c.stream === params.stream);
  }
  if (params.city) {
    filteredColleges = filteredColleges.filter(c => c.city === params.city);
  }
  if (params.course) {
    filteredColleges = filteredColleges.filter(c => c.course === params.course);
  }

  return filteredColleges;
}