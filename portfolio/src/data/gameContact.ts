/* Contact + availability shown in the /game recruiter fast path. */

export const GAME_CONTACT = {
  name: "Louis Zhang",
  availability: "Open to 2027 internship opportunities",
  email: "louzhang15@gmail.com",
  linkedin: "https://www.linkedin.com/in/louis-zhang-ba2a17284/",
  github: "https://github.com/Louiszhang2005-1",
} as const;

export const GAME_INTERNSHIPS = [
  { title: "Tesla", role: "Manufacturing Engineering Intern", when: "Jun–Aug 2026", logo: "/logo/tesla.jpg", missionId: "I-1" },
  { title: "Lockheed Martin", role: "Mechanical Engineering Intern", when: "Jan–Apr 2026", logo: "/logo/Lockheed.webp", missionId: "I-2" },
  { title: "City of Montréal", role: "Engineering Intern", when: "May – Aug 2025", logo: "/logo/city-of-montreal.gif", missionId: "I-4" },
] as const;
