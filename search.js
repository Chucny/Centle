
        const USE_WIKIPEDIA = true;
        const USE_DUCKDUCKGO = true;
        const USE_GDELT = true; // News API
        const USE_OPENLIBRARY = true; // Books API
        const USE_WIKIDATA = false; // Structured Data API
        const USE_DBPEDIA = false; // Entity Linking API

        async function search() {
            const searchResults = document.getElementById("searchResults");
            searchResults.innerHTML = "";

            const query = document.getElementById("searchInput").value;

            if (query) {
                // Wikipedia API Integration
                if (USE_WIKIPEDIA) {
                    try {
                        const wikipediaResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&namespace=0&format=json&origin=*`);
                        const wikipediaData = await wikipediaResponse.json();
                        const [searchTerm, titles, descriptions, links] = wikipediaData;

                        if (titles.length > 0) {
                            for (let i = 0; i < titles.length; i++) {
                                const li = document.createElement("li");
                                const link = document.createElement("a");
                                link.href = links[i];
                                link.textContent = titles[i];
                                li.appendChild(link);

                                const metaDescription = await fetchMetaDescription(links[i]);
                                const desc = document.createElement("p");
                                desc.textContent = metaDescription || descriptions[i];
                                li.appendChild(desc);

                                searchResults.appendChild(li);
                            }
                        } else {
                            const li = document.createElement("li");
                            li.textContent = "No Wikipedia results found.";
                            searchResults.appendChild(li);
                        }
                    } catch (error) {
                        console.error("Error fetching Wikipedia results:", error);
                        const li = document.createElement("li");
                        li.textContent = "Error fetching Wikipedia results.";
                        searchResults.appendChild(li);
                    }
                }

                // DuckDuckGo API Integration
                if (USE_DUCKDUCKGO) {
                    try {
                        const duckduckgoResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
                        const duckduckgoData = await duckduckgoResponse.json();

                        if (duckduckgoData.RelatedTopics && duckduckgoData.RelatedTopics.length > 0) {
                            duckduckgoData.RelatedTopics.forEach(topic => {
                                if (topic.FirstURL && topic.Text) {
                                    const li = document.createElement("li");
                                    const link = document.createElement("a");
                                    link.href = topic.FirstURL;
                                    link.textContent = topic.Text;
                                    li.appendChild(link);
                                    searchResults.appendChild(li);
                                }
                            });
                        } else {
                            const li = document.createElement("li");
                            li.textContent = "No DuckDuckGo results found.";
                            searchResults.appendChild(li);
                        }
                    } catch (error) {
                        console.error("Error fetching DuckDuckGo results:", error);
                        const li = document.createElement("li");
                        li.textContent = "Error fetching DuckDuckGo results.";
                        searchResults.appendChild(li);
                    }
                }

                // Other APIs
                if (USE_GDELT) {
                    try {
                        const gdeltResponse = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=10&format=json`);
                        const gdeltData = await gdeltResponse.json();

                        if (gdeltData.articles && gdeltData.articles.length > 0) {
                            gdeltData.articles.forEach(article => {
                                const li = document.createElement("li");
                                const link = document.createElement("a");
                                link.href = article.url;
                                link.textContent = article.title;
                                li.appendChild(link);
                                const desc = document.createElement("p");
                                desc.textContent = article.description;
                                li.appendChild(desc);
                                searchResults.appendChild(li);
                            });
                        } else {
                            const li = document.createElement("li");
                            li.textContent = "No news results found.";
                            searchResults.appendChild(li);
                        }
                    } catch (error) {
                        console.error("Error fetching GDELT results:", error);
                        const li = document.createElement("li");
                        li.textContent = "Error fetching GDELT results.";
                        searchResults.appendChild(li);
                    }
                }

                if (USE_OPENLIBRARY) {
                    try {
                        const openlibraryResponse = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
                        const openlibraryData = await openlibraryResponse.json();

                        if (openlibraryData.docs && openlibraryData.docs.length > 0) {
                            openlibraryData.docs.forEach(book => {
                                const li = document.createElement("li");
                                const link = document.createElement("a");
                                link.href = `https://openlibrary.org${book.key}`;
                                link.textContent = book.title;
                                li.appendChild(link);
                                const desc = document.createElement("p");
                                desc.textContent = book.author_name ? `Author(s): ${book.author_name.join(', ')}` : '';
                                li.appendChild(desc);
                                searchResults.appendChild(li);
                            });
                        } else {
                            const li = document.createElement("li");
                            li.textContent = "No book results found.";
                            searchResults.appendChild(li);
                        }
                    } catch (error) {
                        console.error("Error fetching OpenLibrary results:", error);
                        const li = document.createElement("li");
                        li.textContent = "Error fetching OpenLibrary results.";
                        searchResults.appendChild(li);
                    }
                }

                if (USE_WIKIDATA) {
                    try {
                        const wikidataResponse = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json`);
                        const wikidataData = await wikidataResponse.json();

                        if (wikidataData.entities && Object.keys(wikidataData.entities).length > 0) {
                            Object.values(wikidataData.entities).forEach(entity => {
                                const li = document.createElement("li");
                                const link = document.createElement("a");
                                link.href = `https://www.wikidata.org/wiki/${entity.id}`;
                                link.textContent = entity.label || entity.description || entity.id;
                                li.appendChild(link);
                                searchResults.appendChild(li);
                            });
                        } else {
                            const li = document.createElement("li");
                            li.textContent = "No Wikidata results found.";
                            searchResults.appendChild(li);
                        }
                    } catch (error) {
                        console.error("Error fetching Wikidata results:", error);
                        const li = document.createElement("li");
                        li.textContent = "Error fetching Wikidata results.";
                        searchResults.appendChild(li);
                    }
                }

                if (USE_DBPEDIA) {
                    try {
                        const dbpediaResponse = await fetch(`https://api.dbpedia-spotlight.org/en/annotate?text=${encodeURIComponent(query)}&confidence=0.5`);
                        const dbpediaData = await dbpediaResponse.json();

                        if (dbpediaData.Resources && dbpediaData.Resources.length > 0) {
                            dbpediaData.Resources.forEach(resource => {
                                const li = document.createElement("li");
                                const link = document.createElement("a");
                                link.href = resource["@URI"];
                                link.textContent = resource["@surfaceForm"];
                                li.appendChild(link);
                                searchResults.appendChild(li);
                            });
                        } else {
                            const li = document.createElement("li");
                            li.textContent = "No DBpedia results found.";
                            searchResults.appendChild(li);
                        }
                    } catch (error) {
                        console.error("Error fetching DBpedia results:", error);
                        const li = document.createElement("li");
                        li.textContent = "Error fetching DBpedia results.";
                        searchResults.appendChild(li);
                    }
                }
            }
        }

        async function fetchMetaDescription(url) {
            try {
                const response = await fetch(url);
                const text = await response.text();
                const metaTag = /<meta name="description" content="(.*?)"/i.exec(text);
                return metaTag ? metaTag[1] : null;
            } catch (error) {
                console.error("Error fetching meta description:", error);
                return null;
            }
        }
