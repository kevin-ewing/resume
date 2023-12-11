const axios = require("axios");
const fs = require("fs");

const username = "kevin-ewing"; // Replace with your GitHub username
const apiUrl = `https://api.github.com/users/${username}/repos`;
const baseFilePath = "../resources/base.json";
const resumeFilePath = "../resources/resume.json";

axios
  .get(apiUrl)
  .then((response) => {
    const repos = response.data;

    return Promise.all(
      repos.map((repo) => {
        return axios.get(repo.languages_url).then((langResponse) => {
          const dateRange = `${repo.created_at.split("T")[0]} - ${
            repo.updated_at.split("T")[0]
          }`;
          return {
            name: repo.name,
            additional_information: {
              description: repo.description,
              languages: langResponse.data,
            },
            date: dateRange,
          };
        });
      })
    );
  })
  .then((repoData) => {
    // Read the existing resume.json file
    fs.readFile(baseFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading resume.json", err);
        return;
      }

      const resume = JSON.parse(data);

      // Check if the 'projects' field exists, if not create it
      if (!resume.projects) {
        resume.projects = [];
      }

      // Append the new repo data to the 'projects' field
      resume.projects.push(...repoData);

      // Write the updated resume back to the file
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
