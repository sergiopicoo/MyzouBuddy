
document.addEventListener('DOMContentLoaded', async function() {
  let items = await fetchItems();
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const result1 = document.getElementById('result1');
  const result2 = document.getElementById('result2');

  
  const fuse = new Fuse(items, { keys: ['code', 'name'] });

  searchButton.addEventListener('click', function() {
      const searchText = searchInput.value.toLowerCase();
      let matches = findClosestMatches(searchText, fuse);

      
      result1.textContent = matches[0] ? `${matches[0].item.code}: ${matches[0].item.name}` : "No match";
      result2.textContent = matches[1] ? `${matches[1].item.code}: ${matches[1].item.name}` : "No match";
  });
});

async function fetchItems() {
  const response = await fetch('scraped_course_names.txt');
  const text = await response.text();
  
  return text.split('\n').map(line => {
      const [code, name] = line.split(':').map(item => item.trim());
      return { code, name };
  });
}

function findClosestMatches(searchText, fuse) {
  
  return fuse.search(searchText).slice(0, 2);
}

result1.addEventListener('click', function() {
  addClassToUser(result1.textContent);
});

result2.addEventListener('click', function() {
  addClassToUser(result2.textContent);
});

async function addClassToUser(className) {
  try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/addclass", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ className }),
      });

      const data = await response.json();

      if (response.ok) {
          console.log("Class added successfully:", className);
          // You may want to update the UI to reflect the change
      } else {
          console.error("Error adding class:", data.error);
      }
  } catch (error) {
      console.error("Error during fetch:", error);
  }
}

