console.log("YouTube script loaded");

function simulateAnalysis() {
    let analysisDone = false; // Flag to ensure analysis is done only once
    let currentVideoId = null;

    function runAnalysis() {
        const videoPlayer = document.querySelector('.html5-video-player');
        const video = videoPlayer.querySelector('video');

        if (!video) {
            console.log("Video element not found.");
            return;
        }

        // Extract video ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('v');

        if (!videoId) {
            console.log("Video ID not found in URL.");
            return;
        }

        if (videoId === currentVideoId) {
            console.log("Same video ID, skipping analysis.");
            return;
        }

        console.log("Video ID:", videoId);
        currentVideoId = videoId;
        analysisDone = false; // Reset the flag for the new video

        // Clear any previous analysis
        const oldCustomLine = document.getElementById('custom-line');
        if (oldCustomLine) {
            oldCustomLine.remove();
        }

        function startAnalysis(analysisResults) {
            if (analysisDone) return; // Prevent re-running the analysis

            // Create a custom line element
            const customLine = document.createElement('div');
            customLine.id = 'custom-line';
            customLine.style.position = 'absolute';
            customLine.style.bottom = '0';
            customLine.style.left = '0';
            customLine.style.width = '100%';
            customLine.style.height = '12px'; // Adjust the height for thickness
            customLine.style.zIndex = '9999'; // Make sure it's above other elements
            customLine.style.display = 'flex';
            customLine.style.overflow = 'hidden';

            // Append the custom line to the video container
            videoPlayer.appendChild(customLine);

            let currentSection = 0;
            const sections = analysisResults.length;

            function processNextSection() {
                if (currentSection >= sections) return;

                const { start, end, model_response } = analysisResults[currentSection];
                const sectionElement = document.createElement('div');
                sectionElement.style.height = '100%';
                sectionElement.style.flexGrow = '0';
                sectionElement.style.flexShrink = '0';
                sectionElement.style.width = '0';
                sectionElement.style.backgroundColor = model_response === "true"
                    ? 'rgba(0, 255, 0, 1)'
                    : model_response === "false"
                    ? 'rgba(255, 0, 0, 1)'
                    : 'rgba(128, 128, 128, 1)'; // Gray color for 'uncertain'
                sectionElement.style.transition = 'flex-grow 1s linear';

                sectionElement.style.cursor = 'pointer';
                sectionElement.addEventListener('click', () => {
                    video.currentTime = start;
                });

                customLine.appendChild(sectionElement);

                setTimeout(() => {
                    sectionElement.style.flexGrow = `${(end - start) / video.duration}`;
                    currentSection++;
                    setTimeout(processNextSection, 200); // Process the next section after a short delay
                }, 100); // Delay before processing the next section
            }

            processNextSection();
            analysisDone = true; // Set the flag to indicate analysis is done
        }

        function checkIfAdIsPlaying() {
            // Check if an ad is playing
            const isAdPlaying = videoPlayer.classList.contains('ad-showing');
            return isAdPlaying;
        }

        // Function to wait until the ad finishes
        function waitForAdToFinish() {
            if (!checkIfAdIsPlaying()) {
                startAnalysis();
            } else {
                setTimeout(waitForAdToFinish, 500); // Check again after 500ms
            }
        }

        // Function to simulate analysis results
        function simulateBackendResponse() {
            const duration = video.duration;
            const sectionDuration = 20;
            const sections = Math.ceil(duration / sectionDuration);
            const analysisResults = [];

            for (let i = 0; i < sections; i++) {
                const start = i * sectionDuration;
                const end = Math.min((i + 1) * sectionDuration, duration);
                const truthValue = Math.random();
                let model_response = null;
                if (truthValue > 0.66) {
                    model_response = "true";
                } else if (truthValue > 0.33) {
                    model_response = "false";
                } else {
                    model_response = "uncertain";
                }
                analysisResults.push({ start, end, model_response });
            }

            startAnalysis(analysisResults);
        }

        // Uncomment and use this function to fetch real data from the API
        /*
        async function fetchAnalysisResults() {
            try {
                const response = await fetch(`http://localhost:5000/api/analysis_results?videoId=${videoId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const analysisResults = await response.json();
                startAnalysis(analysisResults);
            } catch (error) {
                console.error('Error fetching analysis results:', error);
                simulateBackendResponse(); // Fallback to simulated results in case of error
            }
        }
        */

        // Observe video player state changes
        const observer = new MutationObserver(() => {
            if (!video.paused && !video.ended && !checkIfAdIsPlaying()) {
                observer.disconnect(); // Stop observing once analysis starts
                simulateBackendResponse(); // Replace this with fetchAnalysisResults() for real data
                // fetchAnalysisResults(); // Uncomment this to use real data
            }
        });

        // Start observing the video player
        observer.observe(videoPlayer, { attributes: true, attributeFilter: ['class'] });

        // Initial check in case the video is already playing and no ad is showing
        if (!video.paused && !video.ended && !checkIfAdIsPlaying()) {
            simulateBackendResponse(); // Replace this with fetchAnalysisResults() for real data
            // fetchAnalysisResults(); // Uncomment this to use real data
        }
    }

    function resetAnalysis() {
        runAnalysis();
    }

    // Monitor URL changes to detect new video load
    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(resetAnalysis, 500); // Delay to ensure new video is loaded
        }
    }).observe(document, { subtree: true, childList: true });

    runAnalysis(); // Initial run for the first load
}

simulateAnalysis();
