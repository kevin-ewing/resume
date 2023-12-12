function createSectionDivider() {
  const dividerWrapper = document.createElement("div");
  dividerWrapper.style.overflow = "hidden";
  const hr = document.createElement("hr");
  hr.style.marginTop = "0px";
  hr.style.marginBottom = "0";
  dividerWrapper.appendChild(hr);
  return dividerWrapper;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatSkillName(skillName) {
  return skillName.split("_").map(capitalizeFirstLetter).join(" ");
}

function createItemTitle(name, location, date) {
  const titleWrapper = document.createElement("div");
  titleWrapper.style.display = "flex";
  titleWrapper.style.justifyContent = "space-between";
  titleWrapper.style.alignItems = "baseline";

  const nameElement = document.createElement("span");
  nameElement.className = "bold";
  nameElement.textContent = name;

  const locationElement = document.createElement("span");
  locationElement.className = "italic";
  locationElement.textContent = `, ${location}`;

  const nameLocationWrapper = document.createElement("div");
  nameLocationWrapper.appendChild(nameElement);
  nameLocationWrapper.appendChild(locationElement);
  titleWrapper.appendChild(nameLocationWrapper);

  const dateElement = document.createElement("span");
  dateElement.className = "right-justified";
  dateElement.textContent = date;
  titleWrapper.appendChild(dateElement);

  return titleWrapper;
}

function formatSkills(skills) {
  const skillsElement = document.createElement("div");
  for (const key in skills) {
    const skillCategory = document.createElement("div");
    skillCategory.textContent = `${formatSkillName(key)}: ${skills[key].join(
      ", "
    )}`;
    skillsElement.appendChild(skillCategory);
  }
  return skillsElement;
}

function createResumeSection(title, data) {
  const section = document.createElement("div");
  section.className = title.toLowerCase();

  const header = document.createElement("h2");
  header.textContent = title;
  section.appendChild(header);
  section.appendChild(createSectionDivider());

  data.forEach((item) => {
    section.appendChild(createItemTitle(item.name, item.location, item.date));

    if (item.additional_information) {
      Object.entries(item.additional_information).forEach(([key, value]) => {
        const infoElement = document.createElement("div");
        if (key === "skills") {
          const formattedSkills = formatSkills(value);
          infoElement.appendChild(formattedSkills);
        } else if (Array.isArray(value)) {
          value.forEach((subInfo) => {
            const subElement = document.createElement("div");
            subElement.textContent = "• " + subInfo;
            infoElement.appendChild(subElement);
          });
        } else {
          infoElement.textContent = value;
        }
        section.appendChild(infoElement);
      });
    }

    // Increasing spacing between items
    const breakElement = document.createElement("div");
    breakElement.style.marginBottom = "30px"; // Adjust spacing as needed
    section.appendChild(breakElement);
  });

  return section;
}

async function buildResume() {
  const response = await fetch("resources/resume.json");
  const resumeData = await response.json();

  const paperElement = document.querySelector(".paper");

  const educationSection = createResumeSection(
    "Education",
    resumeData.education
  );
  paperElement.appendChild(educationSection);

  const experienceSection = createResumeSection(
    "Experience",
    resumeData.experience
  );
  paperElement.appendChild(experienceSection);

  const projectsSection = createResumeSection(
    "Projects",
    resumeData.experience
  );
  paperElement.appendChild(projectsSection);
}

document.addEventListener("DOMContentLoaded", () => {
  buildResume().catch((error) =>
    console.error("Failed to load resume data:", error)
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  document.getElementById("current-year").textContent = currentYear;
});
