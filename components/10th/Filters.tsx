"use client"

interface FiltersProps {
  filters: {
    skillType: string;
    location: string;
    radius: number;
    salaryMin: string;
    salaryMax: string;
    sortBy: string;
    jobType: string;
    authenticity: string;
  };
  setFilters: (filters: any) => void;
  onApply: () => void;
}

export default function Filters({ filters, setFilters, onApply }: FiltersProps) {
  const skillTypes = [
    { value: '', label: 'All Types' },
    { value: 'skilled_technical', label: 'Skilled - Technical' },
    { value: 'unskilled_non_technical', label: 'Unskilled - Non-Technical' },
    { value: 'event_management', label: 'Event Management' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'tailoring', label: 'Tailoring' },
    { value: 'household', label: 'Household' },
    { value: 'volunteer', label: 'Volunteer' },
  ];

  const jobTypes = [
    { value: '', label: 'All' },
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'time', label: 'Newest First' },
    { value: 'distance', label: 'Distance' },
    { value: 'salary_high', label: 'Salary: High to Low' },
    { value: 'salary_low', label: 'Salary: Low to High' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Jobs</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Type
          </label>
          <select
            value={filters.skillType}
            onChange={(e) => setFilters({ ...filters, skillType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {skillTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <select
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {jobTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="City, State"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Radius (km)
          </label>
          <select
            value={filters.radius}
            onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={3}>3 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Salary (₹)
          </label>
          <input
            type="number"
            value={filters.salaryMin}
            onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
            placeholder="Minimum"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Salary (₹)
          </label>
          <input
            type="number"
            value={filters.salaryMax}
            onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
            placeholder="Maximum"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authenticity
          </label>
          <select
            value={filters.authenticity}
            onChange={(e) => setFilters({ ...filters, authenticity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Jobs</option>
            <option value="real">Real Jobs Only</option>
            <option value="fake">Fake Jobs Only</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={() => {
            setFilters({
              skillType: '',
              location: '',
              radius: 5,
              salaryMin: '',
              salaryMax: '',
              sortBy: 'relevance',
              jobType: '',
              authenticity: '',
            });
            onApply();
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
