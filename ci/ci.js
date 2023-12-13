const axios = require("axios");
const fs = require("fs");

const username = "kevin-ewing"; // Replace with your GitHub username
const apiUrl = `https://api.github.com/users/${username}/repos`;
const baseFilePath = "../resources/base.json"; // Path to your base.json file
const resumeFilePath = "../resources/resume.json"; // Path to your resume.json file

// Helper function to format the date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-US', options);
}

// Helper function to determine if a date is within the last two months
function isRecent(dateString) {
  const date = new Date(dateString);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  return date > twoMonthsAgo;
}

axios
  .get(apiUrl)
  .then((response) => {
    const repos = response.data;

    return Promise.all(
      repos.map((repo) => {
        return axios.get(repo.languages_url).then((langResponse) => {
          const languages = Object.keys(langResponse.data);
          let languagesString = '';
          if (languages.length > 1) {
            languagesString = languages.slice(0, -1).join(', ') + ' and ' + languages[languages.length - 1];
          } else if (languages.length === 1) {
            languagesString = languages[0];
          }

          let dateRange = '';
          const createdDate = formatDate(repo.created_at);
          const updatedDate = formatDate(repo.updated_at);
          if (isRecent(repo.updated_at)) {
            dateRange = `${createdDate} - Present`;
          } else {
            dateRange = `${createdDate} - ${updatedDate}`;
          }

          return {
            name: repo.name,
            additional_information: {
              description: repo.description
            },
            location: languagesString,
            date: dateRange,
          };
        });
      })
    );
  })
  .then((repoData) => {
    // Sort the projects by most recently updated
    repoData.sort((a, b) => new Date(b.date.split(' - ')[1]) - new Date(a.date.split(' - ')[1]));

    fs.readFile(baseFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading base.json", err);
        return;
      }

      const resume = JSON.parse(data);

      if (!resume.projects) {
        resume.projects = [];
      }

      resume.projects.push(...repoData);

      fs.writeFile(resumeFilePath, JSON.stringify(resume, null, 2), (err) => {
        if (err) {
          console.error("Error writing to resume.json", err);
        } else {
          console.log("Successfully updated resume.json");
        }
      });
    });
  })
  .catch((error) => {
    console.error("Error fetching data", error);
  });
