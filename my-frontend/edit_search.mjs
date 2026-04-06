import fs from 'fs';

const navbarPath = 'c:/Users/Windows/Desktop/EWE_NHOM4/my-frontend/src/components/layout/Navbar.jsx';
const homePath = 'c:/Users/Windows/Desktop/EWE_NHOM4/my-frontend/src/pages/Home.jsx';

let navbarCode = fs.readFileSync(navbarPath, 'utf8');

// 1. Add hook import
navbarCode = navbarCode.replace(
  'import { Link, useNavigate } from "react-router-dom";',
  'import { Link, useNavigate, useSearchParams } from "react-router-dom";'
);

// 2. Add searchParams and searchTerm inside Navbar
navbarCode = navbarCode.replace(
  'const navigate = useNavigate();',
  `const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if(q !== null) setSearchTerm(q);
  }, [searchParams]);`
);
  
// 3. Update the handleSearch to reference the new searchTerm
// The old one was added in previous step. Wait, the old one already exists and uses searchTerm. But is it above campuses? Yes.
// Let's replace the handleSearch block to be safe.
navbarCode = navbarCode.replace(
  /const handleSearch = \(e\) => \{[\s\S]*?navigate\(`\/welcome`\);\s*\}\s*\};/,
  `const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(\`/welcome?search=\${encodeURIComponent(searchTerm.trim())}\`);
    } else {
      navigate(\`/welcome\`);
    }
  };`
);

// 4. Update the dropdown for Location
navbarCode = navbarCode.replace(
  /\{selectedCampus &&[\s\S]*?campuses\[selectedCampus\]\.map\(\(area\) => \([\s\S]*?<div key=\{area\} className="dropdown-item">[\s\S]*?\{area\}[\s\S]*?<\/div>[\s\S]*?\)\)\}/,
  `{selectedCampus &&
              campuses[selectedCampus].map((area) => (
                <div 
                  key={area} 
                  className="dropdown-item"
                  onClick={() => {
                    navigate(\`/welcome?search=\${encodeURIComponent(area)}\`);
                    setSearchTerm(area);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {area}
                </div>
              ))}`
);

// 5. Update the search input to include form, value and onChange
navbarCode = navbarCode.replace(
  /<input type="text" placeholder="Search for accommodation\.\.\." \/>/,
  `<form onSubmit={handleSearch} style={{ width: '100%', margin: 0, display: 'flex' }}>
          <input 
            type="text" 
            placeholder="Search for accommodation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>`
);

fs.writeFileSync(navbarPath, navbarCode);


let homeCode = fs.readFileSync(homePath, 'utf8');

// 1. Add hook import
homeCode = homeCode.replace(
  'import { useState, useEffect } from "react";',
  'import { useState, useEffect } from "react";\nimport { useSearchParams } from "react-router-dom";'
);

// 2. Add search query parameter inside Home
homeCode = homeCode.replace(
  /const \[loadingError, setLoadingError\] = useState\(""\);/,
  `const [loadingError, setLoadingError] = useState("");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";`
);

// 3. Filter products on render
homeCode = homeCode.replace(
  /products\.map\(\(p\) => \([\s\S]*?<ProductCard key=\{p\._id \|\| p\.id\} product=\{p\} \/>[\s\S]*?\)\)/,
  `products
            .filter((p) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              const loc = p.location ? p.location.toLowerCase() : "";
              const name = (p.name || p.title) ? (p.name || p.title).toLowerCase() : "";
              return loc.includes(q) || name.includes(q);
            })
            .map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))`
);

fs.writeFileSync(homePath, homeCode);
console.log("Updated Navbar.jsx and Home.jsx successfully");
