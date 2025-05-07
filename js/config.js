export const CONFIG = {
  TEAM_NAME: 'RAXOI',
  CALENDAR_DAYS: 14,
  NUMBER_OF_NEXT_DAYS: 6,
  API_ENDPOINTS: {
    FGP: 'http://competiciones.fgpatinaxe.gal/',
    RFEP: 'https://www.hockeypatines.fep.es/'
  }
};

// App state management object
export const AppState = {
  isFilteredByDays: true, // Start with filtered view (next X days)
  selectedCategories: [],
  
  toggleFilterMode() {
    this.isFilteredByDays = !this.isFilteredByDays;
    return this.isFilteredByDays;
  },
  
  getFilterMode() {
    return this.isFilteredByDays;
  },
  
  setSelectedCategories(categories) {
    this.selectedCategories = categories;
    // Persist to localStorage
    localStorage.setItem('selectedCategories', JSON.stringify(categories));
  },
  
  getSelectedCategories() {
    // Load from localStorage if empty
    if (this.selectedCategories.length === 0) {
      const saved = JSON.parse(localStorage.getItem('selectedCategories')) || [];
      this.selectedCategories = saved;
    }
    return this.selectedCategories;
  }
};
