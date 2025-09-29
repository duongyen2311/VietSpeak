import React, { useState, useEffect, useRef } from 'react';

// --- IMPORTANT CONFIGURATION ---
// You only need this ONE URL from your Google Apps Script deployment.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEjHDVGzFifUtjq4mZJ6H1pl_X0VoS2-aOB2WJv3AAekyyrR0xSm2BgwuPbPKnNIK-5w/exec';
// -----------------------------


// SVG Icons for a polished look without external dependencies
const VolumeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" className="h-5 w-5">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 mx-auto text-slate-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 mx-auto text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

const HeartIcon = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
         fill={filled ? "currentColor" : "none"} 
         stroke="currentColor" 
         strokeWidth="2" 
         strokeLinecap="round" 
         strokeLinejoin="round" 
         className={`w-5 h-5 transition-colors ${filled ? 'text-red-500' : 'text-slate-500'}`}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const ShuffleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="20 16 20 21 15 21"></polyline><line x1="15" y1="15" x2="20" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
);


// Main Application Component
export default function App() {
  // State to manage navigation between pages
  const [page, setPage] = useState('main'); // 'main' or 'archives'
  
  // State for the main page search
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchedTerm, setSearchedTerm] = useState('');
  
  // State for archives page
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [highlightedEntryId, setHighlightedEntryId] = useState(null);

  // Data loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for favorites, stored in localStorage
  const [favorites, setFavorites] = useState(new Set());
  
  // State for available speech synthesis voices
  const [voices, setVoices] = useState([]);

  // State for tracking currently playing audio
  const [playingEntryId, setPlayingEntryId] = useState(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  // State for Challenge mode
  const [challengeStep, setChallengeStep] = useState(0); // 0: inactive, 1: select tabs, 2: select mode
  const [selectedChallengeTabIds, setSelectedChallengeTabIds] = useState([]);
  const [challengeByFavorites, setChallengeByFavorites] = useState(false);
  const [challengeMode, setChallengeMode] = useState(''); // 'quiz' or 'flashcard' or 'voicecard'
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(true);
  const [challengeData, setChallengeData] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizFeedback, setQuizFeedback] = useState({}); 
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Ref for the horizontal tabs container
  const tabsContainerRef = useRef(null);

  // --- Data Fetching ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL')) {
        setError("Please configure the Google Apps Script URL in the code.");
        setIsLoading(false);
        return;
    }

    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=read&t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message);
        }

        const groupedTabs = data.data.filter(row => row.is_deleted !== 1 && row.is_deleted !== '1').reduce((acc, row) => {
            if (!row.tabName) return acc;
            let tab = acc.find(t => t.name === row.tabName);
            if (!tab) {
                tab = { id: Date.now() + Math.random(), name: row.tabName, entries: [] };
                acc.push(tab);
            }
            const vietnamese = row.vietnamese || '';
            const japanese = row.japanese || '';
            tab.entries.push({
                id: `${vietnamese}|${japanese}`, // Create a stable ID
                vi: vietnamese,
                ja: japanese,
                ex: row.example || ''
            });
            return acc;
        }, []);
        
        setTabs(groupedTabs);
        if (!activeTab && groupedTabs.length > 0) {
            setActiveTab(groupedTabs[0].id);
        } else if (activeTab && !groupedTabs.some(t => t.id === activeTab)) {
            setActiveTab(groupedTabs.length > 0 ? groupedTabs[0].id : null);
        }

    } catch (e) {
        console.error("Failed to fetch or parse data:", e);
        setError(`Failed to load data. Please ensure you've re-deployed the latest Google Apps Script and that "Who has access" is set to "Anyone". Error: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  // Load favorites and voices on initial mount
  useEffect(() => {
    try {
        const storedFavorites = localStorage.getItem('vietSpeakFavorites');
        if (storedFavorites) {
            setFavorites(new Set(JSON.parse(storedFavorites)));
        }
    } catch (e) {
        console.error("Could not load favorites from localStorage", e);
    }
    fetchData();

    // Populate speech synthesis voices
    const handleVoicesChanged = () => {
        setVoices(window.speechSynthesis.getVoices());
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        handleVoicesChanged(); // For browsers that load it synchronously
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem('vietSpeakFavorites', JSON.stringify(Array.from(favorites)));
    } catch (e) {
        console.error("Could not save favorites to localStorage", e);
    }
}, [favorites]);


  // Text-to-speech function
  const toggleSpeech = (entry) => {
    if (!entry || !entry.vi) return;

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Your browser does not support this feature.');
      return;
    }
    
    const isCurrentlyActive = playingEntryId === entry.id;

    if (isCurrentlyActive) {
        if (window.speechSynthesis.paused) { // If paused, resume
            window.speechSynthesis.resume();
            setIsSpeechPaused(false);
        } else { // If playing, pause
            window.speechSynthesis.pause();
            setIsSpeechPaused(true);
        }
    } else { // If a new entry is clicked
        window.speechSynthesis.cancel(); // Stop any previous speech

        const utterance = new SpeechSynthesisUtterance(entry.vi);
        utterance.rate = 0.5; // Set speed to 0.5x

        const allVoices = window.speechSynthesis.getVoices();
        const vietnameseVoices = allVoices.filter(voice => voice.lang === 'vi-VN');

        if (vietnameseVoices.length > 0) {
            let selectedVoice = vietnameseVoices.find(voice => /nữ|female/i.test(voice.name));
            if (!selectedVoice) selectedVoice = vietnameseVoices.find(voice => !/nam|male/i.test(voice.name));
            if (!selectedVoice) selectedVoice = vietnameseVoices[vietnameseVoices.length - 1];
            utterance.voice = selectedVoice;
        } else {
            utterance.lang = 'vi-VN';
        }
        
        utterance.onend = () => {
            setPlayingEntryId(null);
            setIsSpeechPaused(false);
        };

        setPlayingEntryId(entry.id);
        setIsSpeechPaused(false);
        window.speechSynthesis.speak(utterance);
    }
  };

  const normalizeVietnamese = (str) => {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
    str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
    str = str.replace(/[ìíịỉĩ]/g, "i");
    str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
    str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
    str = str.replace(/[ỳýỵỷỹ]/g, "y");
    str = str.replace(/đ/g, "d");
    return str.replace(/\s+/g, ' ').trim();
  };

  // Search handler
  const handleSearch = () => {
    const searchTerm = searchText.trim();
    setSearchedTerm(searchTerm);
    if (!searchTerm) {
        setSearchResults([]);
        return;
    }
    const normalizedSearchText = normalizeVietnamese(searchTerm);
    const results = [];
    tabs.forEach(tab => {
        tab.entries.forEach(entry => {
            const content = normalizeVietnamese(`${tab.name} ${entry.vi} ${entry.ja} ${entry.ex}`);
            if (content.includes(normalizedSearchText)) {
                results.push({ ...entry, tabName: tab.name, tabId: tab.id });
            }
        });
    });
    setSearchResults(results);
  };
  
  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setSearchedTerm('');
  };

  const handleSearchTextChange = (e) => {
    const newText = e.target.value;
    setSearchText(newText);
    if (!newText.trim()) {
        setSearchResults([]);
        setSearchedTerm('');
    }
  };

  // Highlight function for search results
  const highlightText = (text, highlight) => {
    const safeText = String(text || '');
    if (!highlight || !safeText) return safeText;
    
    const normalizedText = normalizeVietnamese(safeText);
    const normalizedHighlight = normalizeVietnamese(highlight.trim());
    if (!normalizedHighlight) return safeText;

    const parts = [];
    let lastIndex = 0;
    let matchIndex = normalizedText.indexOf(normalizedHighlight);

    while (matchIndex !== -1) {
      parts.push(safeText.substring(lastIndex, matchIndex));
      const matchedText = safeText.substring(matchIndex, matchIndex + normalizedHighlight.length);
      parts.push(`<mark class="bg-orange-400 text-black px-1 rounded">${matchedText}</mark>`);
      
      lastIndex = matchIndex + normalizedHighlight.length;
      matchIndex = normalizedText.indexOf(normalizedHighlight, lastIndex);
    }
    parts.push(safeText.substring(lastIndex));

    return parts.join('');
  };

  // Click handler for search results
  const handleResultClick = (result) => {
    setPage('archives');
    setActiveTab(result.tabId);
    setHighlightedEntryId(result.id);
    setTimeout(() => setHighlightedEntryId(null), 2500);
  };
  
  // Favorite handler
  const toggleFavorite = (entry) => {
    setFavorites(prevFavorites => {
        const newFavorites = new Set(prevFavorites);
        if (newFavorites.has(entry.id)) {
            newFavorites.delete(entry.id);
        } else {
            newFavorites.add(entry.id);
        }
        return newFavorites;
    });
  };

  const handleGoToArchives = async () => {
    await fetchData();
    setPage('archives');
  };
  
  // --- Challenge Mode Logic ---
  const shuffleArray = (array) => {
    const newArray = [...array];
    let currentIndex = newArray.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
  };
  
  const startChallenge = () => {
    let data = [];
    if (challengeByFavorites) {
        const allEntries = tabs.flatMap(tab => tab.entries);
        data = allEntries.filter(entry => favorites.has(entry.id));
    } else {
        data = tabs
            .filter(tab => selectedChallengeTabIds.includes(tab.id))
            .flatMap(tab => tab.entries);
    }
    
    const finalChallengeData = isShuffleEnabled ? shuffleArray(data) : data;
    
    setChallengeData(finalChallengeData);
    setCurrentChallengeIndex(0);

    if (challengeMode === 'quiz' && finalChallengeData.length > 0) {
        generateQuizOptions(finalChallengeData, 0);
    }

    setChallengeStep(3); // Start the game
  };
  
  const handleCardFlip = () => {
    if (challengeMode === 'flashcard' && !isCardFlipped) {
        const currentCard = challengeData[currentChallengeIndex];
        if(currentCard && currentCard.vi) {
            setTimeout(() => {
                toggleSpeech(currentCard);
            }, 1000);
        }
    }
    setIsCardFlipped(prev => !prev);
  };

  const generateQuizOptions = (allEntries, questionIndex) => {
    if (!allEntries[questionIndex]) return;
    const correctAnswer = allEntries[questionIndex];
    let options = [correctAnswer];
    let allPossibleAnswers = allEntries.filter(e => e.id !== correctAnswer.id);
    shuffleArray(allPossibleAnswers);
    for (let i = 0; i < Math.min(3, allPossibleAnswers.length); i++) {
        options.push(allPossibleAnswers[i]);
    }
    setQuizOptions(shuffleArray(options));
    setQuizFeedback({});
  };

  const handleQuizAnswer = (option) => {
    const isCorrect = option.id === challengeData[currentChallengeIndex].id;
    if (quizFeedback[challengeData[currentChallengeIndex].id] === 'correct') return;

    if (isCorrect) {
        setQuizFeedback({ ...quizFeedback, [option.id]: 'correct' });
        setTimeout(() => {
            if (currentChallengeIndex < challengeData.length - 1) {
                setCurrentChallengeIndex(currentChallengeIndex + 1);
                generateQuizOptions(challengeData, currentChallengeIndex + 1);
            } else {
                setChallengeStep(4);
            }
        }, 1000);
    } else {
        setQuizFeedback({ ...quizFeedback, [option.id]: 'incorrect' });
    }
  };

  const resetChallenge = () => {
    setChallengeStep(0);
    setSelectedChallengeTabIds([]);
    setChallengeByFavorites(false);
    setChallengeMode('');
    setChallengeData([]);
    setCurrentChallengeIndex(0);
    setQuizFeedback({});
    setIsCardFlipped(false);
  };

  const handleBackToSelectMode = () => {
    setChallengeMode('');
    setChallengeData([]);
    setCurrentChallengeIndex(0);
    setQuizFeedback({});
    setIsCardFlipped(false);
    setChallengeStep(2); // Go back to mode selection
  };

  const restartChallenge = () => {
      const newData = isShuffleEnabled ? shuffleArray(challengeData) : [...challengeData];
      setChallengeData(newData);
      setCurrentChallengeIndex(0);
      setIsCardFlipped(false);
      if(challengeMode === 'quiz' && newData.length > 0) {
          generateQuizOptions(newData, 0);
      }
      setChallengeStep(3);
  };


  useEffect(() => {
    if (page === 'archives' && activeTab) {
      const timer = setTimeout(() => {
        const activeTabElement = document.getElementById(`tab-button-${activeTab}`);
        if (activeTabElement) {
          activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [page, activeTab]);

  useEffect(() => {
    if (page === 'archives' && highlightedEntryId) {
        const timer = setTimeout(() => {
            const entryElement = document.getElementById(`entry-item-${highlightedEntryId}`);
            if (entryElement) {
                entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 200);
        return () => clearTimeout(timer);
    }
  }, [highlightedEntryId, page]);

  const renderMainPage = () => (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">Viet<span className="text-orange-400">Speak</span></h1>
      <p className="text-center text-slate-300 mb-8">Search your saved vocabulary</p>
      
      <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl shadow-slate-950/50">
        <div className="relative">
            <textarea
                value={searchText}
                onChange={handleSearchTextChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if(searchText.trim()) handleSearch();
                    }
                }}
                placeholder="Enter a term to search your archives..."
                className="w-full h-20 p-4 pr-10 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-300 resize-none text-lg"
            />
            {searchText && (
                <button 
                    onClick={handleClearSearch} 
                    className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors p-1"
                >
                    <XIcon />
                </button>
            )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleSearch} disabled={!searchText.trim()} className="flex w-full items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <SearchIcon />
                <span>Search</span>
            </button>
            <button onClick={handleGoToArchives} className="flex w-full items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300">
                <SaveIcon />
                <span>Go to Archives</span>
            </button>
        </div>

        <div className="mt-6 max-h-[35vh] overflow-y-auto pr-2">
            {isLoading ? <p className="text-center text-slate-400">Loading...</p> : error ? <p className="text-center text-red-400">{error}</p> :
            searchResults.length > 0 ? (
                <div className="space-y-3">
                    {searchResults.map(result => (
                        <div key={result.id} onClick={() => handleResultClick(result)} className="bg-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                            <p className="text-xs text-orange-400 font-semibold" dangerouslySetInnerHTML={{ __html: highlightText(result.tabName, searchedTerm) }} />
                            <p className="text-white text-lg mt-1" dangerouslySetInnerHTML={{ __html: highlightText(result.vi, searchedTerm) }} />
                            <p className="text-slate-400 text-sm font-light" dangerouslySetInnerHTML={{ __html: highlightText(result.ja, searchedTerm) }} />
                            {result.ex && <p className="text-slate-300 text-sm italic mt-2" dangerouslySetInnerHTML={{ __html: highlightText(`e.g.: ${result.ex}`, searchedTerm) }} />}
                        </div>
                    ))}
                </div>
            ) : ( searchedTerm && ( <div className="text-center text-slate-500 py-12 px-6"> <InfoIcon /> <h3 className="mt-4 text-lg font-semibold text-slate-300">No Results Found</h3> <p className="mt-1 text-sm text-slate-400"> We couldn't find anything matching "{searchedTerm}" in your archives. </p> </div> ))}
        </div>
      </div>
    </div>
  );
  
  const renderChallengeModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            {challengeStep === 1 && (
                <>
                    <h3 className="text-2xl font-bold text-white mb-4">Create a Challenge</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-600 border border-slate-700">
                            <input type="checkbox" className="h-5 w-5 rounded bg-slate-900 border-slate-500 text-orange-500 focus:ring-orange-500" checked={challengeByFavorites} onChange={(e) => { setChallengeByFavorites(e.target.checked); if(e.target.checked) setSelectedChallengeTabIds([]); }} />
                            <span className="text-orange-400 font-bold">Favorites ({favorites.size})</span>
                        </label>

                        <div className="py-2 text-center text-slate-500 text-xs">OR</div>

                        {tabs.map(tab => (
                            <label key={tab.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
                                <input type="checkbox" className="h-5 w-5 rounded bg-slate-900 border-slate-500 text-orange-500 focus:ring-orange-500" checked={selectedChallengeTabIds.includes(tab.id)} onChange={() => {setSelectedChallengeTabIds(prev => prev.includes(tab.id) ? prev.filter(id => id !== tab.id) : [...prev, tab.id]); setChallengeByFavorites(false);}} />
                                <span className="text-white">{tab.name} ({tab.entries.length})</span>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setChallengeStep(2)} disabled={!challengeByFavorites && selectedChallengeTabIds.length === 0} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-slate-600 disabled:opacity-50">Done</button>
                        <button onClick={resetChallenge} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                    </div>
                </>
            )}
            {challengeStep === 2 && (
                 <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white">Select Mode</h3>
                        <button onClick={() => setIsShuffleEnabled(!isShuffleEnabled)} className={`flex items-center gap-2 py-1 px-3 rounded-full text-xs transition-colors ${ isShuffleEnabled ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300' }`}>
                            <ShuffleIcon />
                            <span>Shuffle</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setChallengeMode('quiz')} className={`p-4 rounded-lg text-left font-bold transition-colors ${challengeMode === 'quiz' ? 'bg-orange-500 text-white ring-2 ring-orange-300' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>Quiz</button>
                        <button onClick={() => setChallengeMode('flashcard')} className={`p-4 rounded-lg text-left font-bold transition-colors ${challengeMode === 'flashcard' ? 'bg-orange-500 text-white ring-2 ring-orange-300' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>Flashcard</button>
                        <button onClick={() => setChallengeMode('voicecard')} className={`p-4 rounded-lg text-left font-bold transition-colors ${challengeMode === 'voicecard' ? 'bg-orange-500 text-white ring-2 ring-orange-300' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>Voice Card</button>
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={startChallenge} disabled={!challengeMode} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-slate-600 disabled:opacity-50">Done</button>
                        <button onClick={resetChallenge} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                    </div>
                </>
            )}
        </div>
    </div>
  );

  const renderChallengeView = () => {
    if (challengeData.length === 0) {
        return <div className="text-center"><p>No items in the selected source to start the challenge.</p><button onClick={resetChallenge} className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg">Back</button></div>
    }

    if (challengeStep === 4) { // Challenge Complete
        return (
            <div className="w-full max-w-2xl mx-auto text-center bg-slate-800 p-8 rounded-2xl shadow-2xl">
                <CheckCircleIcon />
                <h2 className="text-3xl font-bold text-white mt-4">Completed!</h2>
                <p className="text-slate-300 mt-2">Great job! You've finished the challenge.</p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={restartChallenge} className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors">{challengeMode === 'quiz' ? 'Play Again' : 'Review Again'}</button>
                    <button onClick={handleBackToSelectMode} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors">Back to Select Mode</button>
                </div>
            </div>
        );
    }
    
    // Quiz View
    if (challengeMode === 'quiz') {
        const currentQuestion = challengeData[currentChallengeIndex];
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-400">Question {currentChallengeIndex + 1} of {challengeData.length}</p>
                    <button onClick={handleBackToSelectMode} className="bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold py-1 px-3 rounded-lg transition-colors">Back to Select Mode</button>
                </div>
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl">
                    <p className="text-slate-300 text-lg mb-4">What is the Japanese for:</p>
                    <h2 className="text-4xl font-bold text-white text-center mb-8">{currentQuestion.vi}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizOptions.map((option, index) => {
                            let buttonClass = 'bg-slate-700 hover:bg-slate-600';
                            const feedback = quizFeedback[option.id];
                            const isQuestionAnswered = quizFeedback[currentQuestion.id] === 'correct';

                            if (feedback === 'correct') {
                                buttonClass = 'bg-green-600';
                            } else if (feedback === 'incorrect') {
                                buttonClass = 'bg-red-600';
                            } else if (isQuestionAnswered) {
                                buttonClass = 'bg-slate-700 opacity-50';
                            }

                            return (
                                <button key={option.id} onClick={() => handleQuizAnswer(option)} disabled={feedback === 'incorrect' || isQuestionAnswered} className={`p-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 flex items-center ${buttonClass}`}>
                                    <span className="font-bold mr-3 text-orange-300">{String.fromCharCode(65 + index)}.</span>
                                    <span>{option.ja}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        )
    }

     // Flashcard View
    if (challengeMode === 'flashcard') {
        const currentCard = challengeData[currentChallengeIndex];
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-400">Card {currentChallengeIndex + 1} of {challengeData.length}</p>
                    <button onClick={handleBackToSelectMode} className="bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold py-1 px-3 rounded-lg transition-colors">Back to Select Mode</button>
                </div>
                <div className="perspective-1000">
                     <div className={`relative w-full h-64 transition-transform duration-700 preserve-3d ${isCardFlipped ? 'rotate-y-180' : ''}`} onClick={handleCardFlip}>
                        <div className="absolute w-full h-full backface-hidden bg-slate-700 rounded-2xl flex items-center justify-center p-6 shadow-2xl">
                            <h2 className="text-4xl font-bold text-white text-center">{currentCard.ja}</h2>
                        </div>
                        <div className="absolute w-full h-full backface-hidden bg-orange-500 rounded-2xl flex items-center justify-center p-6 shadow-2xl rotate-y-180">
                            <h2 className="text-4xl font-bold text-white text-center">{currentCard.vi}</h2>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => { setIsCardFlipped(false); setTimeout(() => setCurrentChallengeIndex(i => i > 0 ? i - 1 : i), 200); }} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors">Previous</button>
                    <button onClick={() => { if (currentChallengeIndex < challengeData.length - 1) { setIsCardFlipped(false); setTimeout(() => setCurrentChallengeIndex(i => i + 1), 200); } else { setChallengeStep(4); } }} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors">Next</button>
                </div>
            </div>
        )
    }

     // Voice Card View
    if (challengeMode === 'voicecard') {
        const currentCard = challengeData[currentChallengeIndex];
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-400">Card {currentChallengeIndex + 1} of {challengeData.length}</p>
                    <button onClick={handleBackToSelectMode} className="bg-orange-500 text-white hover:bg-orange-600 text-xs font-bold py-1 px-3 rounded-lg transition-colors">Back to Select Mode</button>
                </div>
                <div className="perspective-1000">
                     <div className={`relative w-full h-64 transition-transform duration-700 preserve-3d ${isCardFlipped ? 'rotate-y-180' : ''}`} onClick={() => setIsCardFlipped(!isCardFlipped)}>
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-slate-700 rounded-2xl flex items-center justify-center p-6 shadow-2xl cursor-pointer">
                           <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card from flipping when clicking button
                                    toggleSpeech(currentCard);
                                }} 
                                className="text-orange-400 p-4 rounded-full bg-slate-800 hover:bg-slate-900 transition-colors"
                            >
                                {playingEntryId === currentCard.id && !isSpeechPaused ? <PauseIcon /> : <VolumeIcon />}
                            </button>
                        </div>
                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden bg-orange-500 rounded-2xl flex flex-col items-center justify-center p-6 shadow-2xl rotate-y-180 cursor-pointer">
                            <h2 className="text-3xl font-bold text-white text-center">{currentCard.vi}</h2>
                            <p className="text-xl text-white/80 mt-2">{currentCard.ja}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => { setIsCardFlipped(false); setTimeout(() => setCurrentChallengeIndex(i => i > 0 ? i - 1 : i), 200); }} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors">Previous</button>
                    <button onClick={() => { if (currentChallengeIndex < challengeData.length - 1) { setIsCardFlipped(false); setTimeout(() => setCurrentChallengeIndex(i => i + 1), 200); } else { setChallengeStep(4); } }} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 transition-colors">Next</button>
                </div>
            </div>
        )
    }
  };
  
  const renderArchivesPage = () => {
      const activeTabData = tabs.find(t => t.id === activeTab);
      return (
        <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 overflow-hidden h-[90vh] sm:h-[85vh] flex flex-col">
           <div className="p-4 sm:p-6 bg-slate-900/50 flex justify-between items-center border-b border-slate-700">
            <button onClick={() => setPage('main')} className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors">
                <ArrowLeftIcon />
                <span className="hidden sm:inline">Main Page</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Archives</h2>
            <div className="flex items-center gap-2">
                 <button onClick={() => setChallengeStep(1)} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-orange-600 transition-colors">Challenge</button>
            </div>
          </div>
    
          <div ref={tabsContainerRef} className="flex-shrink-0 p-2 sm:p-4 border-b border-slate-700 overflow-x-auto">
            <div className="flex items-center gap-2">
              {isLoading ? <p className="text-slate-400 px-2">Loading tabs...</p> : tabs.map(tab => (
                <div key={tab.id} className="relative group">
                  <button id={`tab-button-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`py-2 px-4 rounded-lg text-sm sm:text-base font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{tab.name}</button>
                </div>
              ))}
            </div>
          </div>
    
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
            <div className="animate-fade-in">
              <div className="max-h-[calc(100%-1rem)] overflow-y-auto px-2">
                {isLoading ? <p className="text-center text-slate-400 p-8">Loading entries...</p> : activeTabData?.entries.map(entry => (
                  <div key={entry.id} id={`entry-item-${entry.id}`} className={`bg-slate-700 p-4 rounded-lg mb-3 transition-all hover:bg-slate-600/50 ${highlightedEntryId === entry.id ? 'ring-2 ring-orange-400 shadow-lg shadow-orange-500/20' : ''}`}>
                      <div className="flex items-start justify-between">
                          <div className="flex-grow">
                              <p className="text-white text-lg">{entry.vi}</p>
                              <p className="text-slate-400 text-sm font-light mt-1">{entry.ja}</p>
                              {entry.ex && <div className="mt-3 pt-3 border-t border-slate-600"><p className="text-slate-300 text-sm italic">e.g.: {entry.ex}</p></div>}
                          </div>
                          <div className="flex flex-col items-center flex-shrink-0 ml-4 space-y-2">
                              <button onClick={() => toggleSpeech(entry)} className="text-orange-400 p-2 rounded-full hover:bg-slate-800 transition-colors">{playingEntryId === entry.id && !isSpeechPaused ? <PauseIcon /> : <VolumeIcon />}</button>
                              <button onClick={() => toggleFavorite(entry)} className="p-2 rounded-full"><HeartIcon filled={favorites.has(entry.id)} /></button>
                          </div>
                      </div>
                  </div>
                )) || <p className="text-slate-400 text-center p-8">Select a tab or create a new one.</p>}
              </div>
            </div>
          </div>
        </div>
      );
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Noto+Sans+JP:wght@300;400;700&display=swap');
        body { font-family: 'Inter', 'Noto Sans JP', sans-serif; }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .overflow-y-auto::-webkit-scrollbar { width: 8px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #1e2 brisket; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #fb923c; }
        .overflow-x-auto::-webkit-scrollbar { height: 9px; }
        .overflow-x-auto::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .font-light { font-weight: 300; }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
      <main className="bg-slate-900 min-h-screen text-white flex items-center justify-center p-4">
        {challengeStep >= 3 ? renderChallengeView() : (page === 'main' ? renderMainPage() : renderArchivesPage())}
        {challengeStep > 0 && challengeStep < 3 && renderChallengeModal()}
      </main>
      <footer className="bg-slate-900 text-center p-4 text-slate-500 text-sm fixed bottom-0 w-full">
        Created by YenDh
      </footer>
    </>
  );
}

