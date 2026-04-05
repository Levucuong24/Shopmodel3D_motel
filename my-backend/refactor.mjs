import fs from 'fs';
import path from 'path';

const SRC_DIR = 'C:/Users/Windows/Desktop/EWE_NHOM4/my-backend/src';
const APP_JS = 'C:/Users/Windows/Desktop/EWE_NHOM4/my-backend/src/app.js';
const SEED_JS = 'C:/Users/Windows/Desktop/EWE_NHOM4/my-backend/seed.js';

const MODULES = {
  auth: {
    controllers: ['auth.controller.js'],
    routes: ['auth.routes.js'],
    services: ['auth.service.js'],
    models: []
  },
  room: {
    controllers: ['room.controller.js'],
    routes: ['room.routes.js'],
    services: ['room.service.js'],
    models: ['Room.js', 'SavedRoom.js']
  },
  chatbot: {
    controllers: ['chatbot.controller.js'],
    routes: ['chatbot.routes.js'],
    services: ['chatbot.service.js'],
    models: ['ChatSession.js', 'Message.js']
  },
  payment: {
    controllers: ['payment.controller.js'],
    routes: ['payment.routes.js'],
    services: ['payment.service.js'],
    models: ['Payment.js', 'Revenue.js']
  },
  user: {
    controllers: ['user.controller.js'],
    routes: ['user.routes.js'],
    services: [],
    models: ['User.js']
  },
  ai: {
    controllers: ['ai.controller.js'],
    routes: ['ai.routes.js'],
    services: ['ai.service.js'],
    models: ['AIGeneration.js']
  },
  contract: {
    controllers: ['contract.controller.js'],
    routes: ['contract.routes.js'],
    services: [],
    models: ['Contract.js']
  },
  review: {
    controllers: ['review.controller.js'],
    routes: ['review.routes.js'],
    services: [],
    models: ['Review.js']
  },
  viewing: {
    controllers: ['viewing.controller.js'],
    routes: ['viewing.routes.js'],
    services: [],
    models: ['ViewingRequest.js']
  }
};

// Map each file to its target module
const getModuleForFile = (filename) => {
  for (const [modName, types] of Object.entries(MODULES)) {
    if (
      types.controllers.includes(filename) ||
      types.routes.includes(filename) ||
      types.services.includes(filename) ||
      types.models.includes(filename)
    ) {
      return modName;
    }
  }
  return null;
};

// 1. Create modules directory and move files
const modulesDir = path.join(SRC_DIR, 'modules');
if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir);

for (const modName of Object.keys(MODULES)) {
  const modDir = path.join(modulesDir, modName);
  if (!fs.existsSync(modDir)) fs.mkdirSync(modDir);
}

// Helper to move file
const fileMapping = [];
const moveFile = (oldFolder, filename, modName) => {
  const oldPath = path.join(SRC_DIR, oldFolder, filename);
  const newPath = path.join(modulesDir, modName, filename);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    fileMapping.push({ filename, modName, newPath });
  }
};

// Move models, controllers, routes, services
for (const [modName, types] of Object.entries(MODULES)) {
  for (const f of types.models) moveFile('models', f, modName);
  for (const f of types.controllers) moveFile('controllers', f, modName);
  for (const f of types.routes) moveFile('routes', f, modName);
  for (const f of types.services) moveFile('services', f, modName);
}

// Move route index and models index
if (fs.existsSync(path.join(SRC_DIR, 'routes', 'index.js'))) {
  fs.renameSync(path.join(SRC_DIR, 'routes', 'index.js'), path.join(modulesDir, 'index.js'));
}
if (fs.existsSync(path.join(SRC_DIR, 'models', 'index.js'))) {
  fs.renameSync(path.join(SRC_DIR, 'models', 'index.js'), path.join(modulesDir, 'models.js'));
}

// 2. Rewrite imports in all files in src/modules
const replaceImports = (content, currentModule) => {
  return content
    .replace(/from\s+['"]\.\.\/models\/(.*?)['"]/g, (match, $1) => {
      const targetMod = getModuleForFile($1);
      if (targetMod === currentModule) return `from "./${$1}"`;
      return `from "../${targetMod}/${$1}"`;
    })
    .replace(/from\s+['"]\.\.\/controllers\/(.*?)['"]/g, (match, $1) => {
      const targetMod = getModuleForFile($1);
      if (targetMod === currentModule) return `from "./${$1}"`;
      return `from "../${targetMod}/${$1}"`;
    })
    .replace(/from\s+['"]\.\.\/services\/(.*?)['"]/g, (match, $1) => {
      const targetMod = getModuleForFile($1);
      if (targetMod === currentModule) return `from "./${$1}"`;
      return `from "../${targetMod}/${$1}"`;
    })
    .replace(/require\(['"]\.\/(.*?)['"]\)/g, (match, $1) => {
      if (!$1.includes(".js")) $1 = $1 + ".js"; // Some are just './User'
      const targetMod = getModuleForFile($1);
      if (targetMod === currentModule) return `require("./${$1}")`;
      if (targetMod) return `require("../${targetMod}/${$1}")`;
      return match;
    });
};

const processDir = (dir, currentMod) => {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      processDir(p, f);
    } else if (f.endsWith('.js')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // Update routes/index.js -> modules/index.js
      if (dir === modulesDir && f === 'index.js') {
         content = content.replace(/from\s+['"]\.\/(.*?)['"]/g, (match, $1) => {
           const targetMod = getModuleForFile($1);
           if (targetMod) return `from "./${targetMod}/${$1}"`;
           return match;
         });
      }
      
      // Update models/index.js -> modules/models.js
      if (dir === modulesDir && f === 'models.js') {
         content = content.replace(/require\(['"]\.\/(.*?)['"]\)/g, (match, $1) => {
           if (!$1.endsWith(".js") && !$1.startsWith("mongoose")) $1 += ".js";
           const targetMod = getModuleForFile($1);
           if (targetMod) return `require("./${targetMod}/${$1}")`;
           return match;
         });
      }

      // Normal module files update
      if (dir !== modulesDir) {
         content = replaceImports(content, currentMod);
      }

      fs.writeFileSync(p, content);
    }
  }
};

processDir(modulesDir, null);

// 3. Update app.js
if (fs.existsSync(APP_JS)) {
  let appjs = fs.readFileSync(APP_JS, 'utf8');
  appjs = appjs.replace('routes/index.js', 'modules/index.js');
  fs.writeFileSync(APP_JS, appjs);
}

// 4. Update seed.js
if (fs.existsSync(SEED_JS)) {
  let seedjs = fs.readFileSync(SEED_JS, 'utf8');
  seedjs = seedjs.replace(/models\/Room/g, 'modules/room/Room');
  seedjs = seedjs.replace(/from\s+['"]\.\/src\/models\/index\.js['"]/, 'from "./src/modules/models.js"');
  fs.writeFileSync(SEED_JS, seedjs);
}

// Print done
console.log("Migration completed");
