import fs from 'fs';

const homePath = 'c:/Users/Windows/Desktop/EWE_NHOM4/my-frontend/src/pages/Home.jsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

// The block to extract is <div className="projects">...</div>
const projectsMatch = homeCode.match(/<div className="projects">[\s\S]*?<\/div>\s*<\/div>/);
if (projectsMatch) {
  const projectsBlock = projectsMatch[0];
  
  // Remove the block from its current place
  homeCode = homeCode.replace(projectsBlock, '');
  
  // Insert it right after <Advantages />
  homeCode = homeCode.replace(/<Advantages \/>/, `<Advantages />\n\n      ${projectsBlock}`);
  
  fs.writeFileSync(homePath, homeCode);
  console.log("Successfully moved 'projects' block after Advantages.");
} else {
  console.log("Could not find the projects block.");
}
