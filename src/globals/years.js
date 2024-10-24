let allYears = [];
const thisYear = new Date().getFullYear();
for (var year = 2008; year <= thisYear; year++) {
  allYears.push({
    year: year,
    slag: year == thisYear ? "" : `${year}/`
  });
}

export default allYears;