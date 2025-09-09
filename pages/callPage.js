export class CallPage {
  constructor(page) {
    this.page = page;

    // Call module locators
    this.callLink = page.getByRole('link', { name: 'Call' }).first();
    this.dialpadIcon = page.locator("//span[@class='anticon anticon-dial ']//*[name()='svg']");
    this.inputField = page.getByRole("textbox", { name: "Enter a Number or Extension" });
    this.dialButton = page.locator("//span[@class='ant-btn-icon']//span[contains(@class,'anticon anticon-call')]//*[name()='svg']");
    this.acceptCallButton = page.locator("//span[normalize-space()='Accept']");
    this.connectingText = page.getByText('Connecting...');
    
    // Call control locators
    this.dialerName = page.locator("//div[@class='text-ellipsis']");
    this.muteButton = page.locator("//div[text()='Mute']/preceding-sibling::button");
    this.moreButton = page.locator("#more-button");
    this.recordButton = page.locator("#record-button");
    this.recordingToast = page.locator("//div[@class='ant-message-custom-content ant-message-success']");
    this.endCallButton = page.locator("#end-call-button");
    this.closeCallButton = page.locator("//button[@class='ant-btn css-fbl77k ant-btn-gray ant-btn-sm sc-fGFwAa jezLFp text']");
    
    // Call history locators
    this.callHistoryIcon = page.locator("//span[contains(@class,'anticon anticon-call')]");
    this.callHistoryURL = "https://staging.ocgo.us/calls/all-calls";
    this.callHistoryRow = page.locator("table tbody tr").first();
    this.callOptionsDropdown = page.locator("//td[@class='ant-table-cell ant-table-cell-fix-right ant-table-cell-fix-right-first ant-table-cell-row-hover']//a[@class='ant-dropdown-trigger']");
    this.downloadRecordingOption = page.locator("//div[normalize-space()='Download Recording']");
    
    // Voicemail locators
    this.declineCallButton = page.locator("//span[normalize-space()='Decline']");
    this.voicemailLink = page.locator("//a[text()='Voicemail']");
    this.voicemailCount = page.locator("//sup[contains(@class,'ant-badge-count')]").nth(2);
    this.voicemailTable = page.locator("table");
    this.latestVoicemailRow = page.locator("table tbody tr").first();
    this.voicemailOptionsDropdown = page.locator("//a[@class='ant-dropdown-trigger']").nth(1);
    this.downloadVoicemailOption = page.locator("//span/div[text()='Download']");
  }

  // Navigation methods
  async navigateToCallSection() {
    await this.callLink.waitFor({ state: 'visible', timeout: 30000 });
    await this.callLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(5000);
  }

  // Dialing methods
  async openDialpad() {
    await this.dialpadIcon.waitFor({ state: 'visible', timeout: 10000 });
    await this.dialpadIcon.click();
  }

  async enterRecipient(extension) {
    await this.inputField.fill(extension);
  }

  async dialCall() {
    await this.dialButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.dialButton.click();
    console.log('Dial button clicked, waiting for call to initiate...');
  }

  // Call handling methods
  async acceptCall() {
    try {
      // Wait for incoming call notification
      await this.page.waitForTimeout(5000);
      
      // Try different possible selectors for accept button
      const acceptSelectors = [
        '//span[normalize-space()="Accept"]',
        '//button[contains(text(), "Accept")]',
        '[data-testid="accept-call"]',
        '.accept-call-button',
        '//span[contains(@class, "accept")]'
      ];
      
      let acceptButton = null;
      for (const selector of acceptSelectors) {
        try {
          acceptButton = this.page.locator(selector);
          await acceptButton.waitFor({ state: 'visible', timeout: 3000 });
          console.log(`Found accept button with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`Accept button not found with selector: ${selector}`);
        }
      }
      
      if (acceptButton) {
        await acceptButton.click();
      } else {
        // Take screenshot for debugging
        await this.page.screenshot({ path: '/tmp/no-accept-button.png' });
        console.log('No accept button found. Screenshot saved to /tmp/no-accept-button.png');
        throw new Error('Accept call button not found with any selector');
      }
    } catch (error) {
      console.log('Error in acceptCall:', error.message);
      throw error;
    }
  }

  async verifyConnecting() {
    await this.connectingText.waitFor({ state: 'visible', timeout: 30000 });
    return await this.connectingText.isVisible();
  }

  async getDialerName() {
    await this.dialerName.waitFor({ state: 'visible', timeout: 10000 });
    return await this.dialerName.textContent();
  }

  // Call control methods
  async muteCall() {
    await this.muteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.muteButton.click();
    await this.page.waitForTimeout(500); // Wait for UI update
    return await this.muteButton.getAttribute('class');
  }

  async startRecording() {
    await this.moreButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.moreButton.click();
    await this.recordButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.recordButton.click();
    await this.recordingToast.waitFor({ state: 'visible', timeout: 10000 });
    return await this.recordingToast.textContent();
  }

  async stopRecording() {
    await this.moreButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.moreButton.click();
    await this.recordButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.recordButton.click();
  }

  async endCall() {
    await this.endCallButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.endCallButton.click();
  }

  async closeCallPopup() {
    await this.closeCallButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.closeCallButton.click();
  }

  // Call history methods
  async openCallHistory() {
    await this.callHistoryIcon.waitFor({ state: 'visible', timeout: 5000 });
    await this.callHistoryIcon.click();
    await this.page.waitForURL(this.callHistoryURL, { timeout: 10000 });
  }

  async downloadRecording() {
    await this.callHistoryRow.waitFor({ state: 'visible', timeout: 10000 });
    await this.callHistoryRow.hover();
    await this.callOptionsDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.callOptionsDropdown.click();
    await this.downloadRecordingOption.waitFor({ state: 'visible', timeout: 5000 });
    await this.downloadRecordingOption.click();
  }

  // Voicemail methods
  async declineCall() {
    try {
      await this.page.waitForTimeout(5000); // Wait for incoming call notification
      
      const declineSelectors = [
        '//span[normalize-space()="Decline"]',
        '//button[contains(text(), "Decline")]',
        '[data-testid="decline-call"]',
        '.decline-call-button'
      ];
      
      let declineButton = null;
      for (const selector of declineSelectors) {
        try {
          declineButton = this.page.locator(selector);
          await declineButton.waitFor({ state: 'visible', timeout: 3000 });
          console.log(`Found decline button with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`Decline button not found with selector: ${selector}`);
        }
      }
      
      if (declineButton) {
        await declineButton.click();
      } else {
        await this.page.screenshot({ path: '/tmp/no-decline-button.png' });
        console.log('No decline button found. Screenshot saved to /tmp/no-decline-button.png');
        throw new Error('Decline call button not found with any selector');
      }
    } catch (error) {
      console.log('Error in declineCall:', error.message);
      throw error;
    }
  }

  async getVoicemailCount() {
      await this.voicemailCount.waitFor({ state: 'visible', timeout: 5000 });
      const countText = await this.voicemailCount.getAttribute('title');
      return parseInt(countText);
  }

  async openVoicemail() {
    await this.voicemailLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.voicemailLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  async getLatestVoicemailRecord() {
    await this.latestVoicemailRow.waitFor({ state: 'visible', timeout: 10000 });
    
    const usernameCell = this.latestVoicemailRow.locator('td').nth(1);
    const dateCell = this.latestVoicemailRow.locator('td').nth(3);

    const username = await usernameCell.textContent();
    const date = await dateCell.textContent();
    
    return {
      username: username?.trim() || '',
      date: date?.trim() || ''
    };
  }

  async clickVoicemailOptions() {
    await this.latestVoicemailRow.waitFor({ state: 'visible', timeout: 10000 });
    await this.latestVoicemailRow.click();
    await this.voicemailOptionsDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.voicemailOptionsDropdown.click();
  }

  async downloadVoicemail() {
    await this.downloadVoicemailOption.waitFor({ state: 'visible', timeout: 5000 });
    await this.downloadVoicemailOption.click();
  }

  async downloadAndVerifyVoicemail(originalAudioPath = null) {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadVoicemail();
    const download = await downloadPromise;
    
    // Get the downloaded file path
    const downloadPath = await download.path();
    console.log('Downloaded file path:', downloadPath);
    
    // Verify the WAV file
    const fs = require('fs');
    
    // Assert file exists
    if (!fs.existsSync(downloadPath)) {
      throw new Error('Downloaded file does not exist');
    }
    console.log('✓ Download file exists');
    
    // Assert file extension
    const filename = download.suggestedFilename();
    if (!filename.match(/\.wav$/i)) {
      throw new Error(`Expected .wav file, got: ${filename}`);
    }
    console.log('✓ File has .wav extension:', filename);
    
    // Assert file size (wav files should be > 44 bytes for header + audio data)
    const fileStats = fs.statSync(downloadPath);
    if (fileStats.size <= 44) {
      throw new Error(`WAV file too small: ${fileStats.size} bytes`);
    }
    console.log('✓ File size is valid:', fileStats.size, 'bytes');
    
    // Read and verify WAV file header
    const buffer = fs.readFileSync(downloadPath);
    
    // Check WAV file signature (first 4 bytes should be "RIFF")
    const riffSignature = buffer.toString('ascii', 0, 4);
    if (riffSignature !== 'RIFF') {
      throw new Error(`Invalid WAV signature: ${riffSignature}`);
    }
    console.log('✓ Valid WAV RIFF signature');
    
    // Check WAV format (bytes 8-11 should be "WAVE")
    const waveFormat = buffer.toString('ascii', 8, 12);
    if (waveFormat !== 'WAVE') {
      throw new Error(`Invalid WAVE format: ${waveFormat}`);
    }
    console.log('✓ Valid WAVE format identifier');
    
    // Check if file contains actual audio data (not just silence)
    const audioData = buffer.slice(44);
    const hasNonZeroData = audioData.some(byte => byte !== 0);
    if (!hasNonZeroData) {
      throw new Error('WAV file contains only silence (all zero bytes)');
    }
    console.log('✓ File contains non-zero audio data');
    
    // Compare with original recording if provided
    let audioMatchResult = { matches: false, similarity: 0 };
    if (originalAudioPath && fs.existsSync(originalAudioPath)) {
      audioMatchResult = await this.compareAudioFiles(downloadPath, originalAudioPath);
      console.log(`✓ Audio comparison completed: ${audioMatchResult.similarity}% similarity`);
    }
    
    console.log('All WAV file assertions passed! 🎉');
    
    return {
      path: downloadPath,
      filename: filename,
      size: fileStats.size,
      isValid: true,
      audioMatch: audioMatchResult
    };
  }

  async compareAudioFiles(downloadedFile, originalFile) {
    try {
      const fs = require('fs');
      
      // Read both files
      const downloadedBuffer = fs.readFileSync(downloadedFile);
      const originalBuffer = fs.readFileSync(originalFile);
      
      // Extract audio data (skip WAV headers - first 44 bytes)
      const downloadedAudio = downloadedBuffer.slice(44);
      const originalAudio = originalBuffer.slice(44);
      
      console.log(`Comparing audio: Downloaded=${downloadedAudio.length} bytes, Original=${originalAudio.length} bytes`);
      
      // Basic duration comparison
      const durationRatio = Math.min(downloadedAudio.length, originalAudio.length) / Math.max(downloadedAudio.length, originalAudio.length);
      console.log(`Duration similarity: ${(durationRatio * 100).toFixed(1)}%`);
      
      // Sample-based comparison (compare every 100th sample to avoid performance issues)
      const sampleStep = 100;
      let matchingBytes = 0;
      let totalComparisons = 0;
      const maxSamples = Math.min(downloadedAudio.length, originalAudio.length);
      
      for (let i = 0; i < maxSamples; i += sampleStep) {
        const downloadedSample = downloadedAudio[i];
        const originalSample = originalAudio[i];
        
        // Check if samples are similar (within tolerance)
        const tolerance = 50; // Allow some variation due to encoding/compression
        if (Math.abs(downloadedSample - originalSample) <= tolerance) {
          matchingBytes++;
        }
        totalComparisons++;
      }
      
      const sampleSimilarity = totalComparisons > 0 ? (matchingBytes / totalComparisons) * 100 : 0;
      console.log(`Sample similarity: ${sampleSimilarity.toFixed(1)}% (${matchingBytes}/${totalComparisons} samples match)`);
      
      // RMS (Root Mean Square) energy comparison
      const downloadedRMS = this.calculateRMS(downloadedAudio);
      const originalRMS = this.calculateRMS(originalAudio);
      const energySimilarity = Math.min(downloadedRMS, originalRMS) / Math.max(downloadedRMS, originalRMS) * 100;
      console.log(`Energy similarity: ${energySimilarity.toFixed(1)}% (Downloaded RMS: ${downloadedRMS.toFixed(2)}, Original RMS: ${originalRMS.toFixed(2)})`);
      
      // Overall similarity score (weighted average)
      const overallSimilarity = (durationRatio * 30 + sampleSimilarity * 0.4 + energySimilarity * 0.3);
      
      // Consider it a match if similarity > 60%
      const matches = overallSimilarity > 60;
      
      console.log(`Overall audio similarity: ${overallSimilarity.toFixed(1)}% - ${matches ? 'MATCH' : 'NO MATCH'}`);
      
      return {
        matches: matches,
        similarity: parseFloat(overallSimilarity.toFixed(1)),
        details: {
          duration: parseFloat((durationRatio * 100).toFixed(1)),
          samples: parseFloat(sampleSimilarity.toFixed(1)),
          energy: parseFloat(energySimilarity.toFixed(1))
        }
      };
      
    } catch (error) {
      console.error('Error comparing audio files:', error);
      return { matches: false, similarity: 0, error: error.message };
    }
  }

  calculateRMS(audioBuffer) {
    let sum = 0;
    for (let i = 0; i < audioBuffer.length; i += 2) {
      // Convert bytes to 16-bit samples (little-endian)
      const sample = audioBuffer[i] | (audioBuffer[i + 1] << 8);
      const normalizedSample = sample / 32768.0; // Normalize to -1 to 1
      sum += normalizedSample * normalizedSample;
    }
    return Math.sqrt(sum / (audioBuffer.length / 2));
  }

  // Audio simulation method for voicemail recording
  async simulateVoicemailRecording(audioFilePath) {
    try {
      // Grant microphone permissions
      await this.page.context().grantPermissions(['microphone']);
      
      console.log('Setting up real audio file for voicemail recording');
      
      // Convert audio file to base64 for browser use
      const fs = require('fs');
      const audioBuffer = fs.readFileSync(audioFilePath);
      const audioBase64 = audioBuffer.toString('base64');
      const audioDataUrl = `data:audio/wav;base64,${audioBase64}`;
      
      await this.page.evaluate(async (dataUrl) => {
        // Create audio element from your actual recording
        const audio = new Audio(dataUrl);
        audio.loop = true; // Loop the audio to ensure continuous stream
        
        // Wait for audio to load
        await new Promise((resolve, reject) => {
          audio.onloadeddata = resolve;
          audio.onerror = reject;
          audio.load();
        });
        
        // Create audio context and connect audio to MediaStream
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const source = audioContext.createMediaElementSource(audio);
        const destination = audioContext.createMediaStreamDestination();
        
        // Add gain node to ensure proper audio levels
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0;
        
        // Connect: source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(destination);
        
        // Also connect to speakers for monitoring (optional)
        gainNode.connect(audioContext.destination);
        
        // Start playing immediately to ensure stream is active
        await audio.play();
        
        // Override getUserMedia to return stream with your audio
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
        navigator.mediaDevices.getUserMedia = async (constraints) => {
          console.log('getUserMedia called with constraints:', constraints);
          if (constraints.audio) {
            // Ensure audio is playing
            if (audio.paused) {
              await audio.play();
            }
            console.log('Returning custom audio stream');
            return destination.stream;
          }
          return originalGetUserMedia.call(navigator.mediaDevices, constraints);
        };
        
        // Store references for cleanup
        window._voicemailAudio = audio;
        window._voicemailContext = audioContext;
        window._voicemailSource = source;
        window._voicemailGain = gainNode;
        window._voicemailStream = destination.stream;
        
        console.log('Audio stream setup complete, stream active:', !destination.stream.getTracks()[0].muted);
        
      }, audioDataUrl);
      
      console.log('Real audio file setup complete');
    } catch (error) {
      console.error('Error setting up voicemail recording:', error);
    }
  }

  async stopVoicemailRecording() {
    await this.page.evaluate(() => {
      if (window._voicemailAudio) {
        window._voicemailAudio.pause();
        window._voicemailAudio.currentTime = 0;
      }
      if (window._voicemailSource) {
        window._voicemailSource.disconnect();
      }
      if (window._voicemailContext) {
        window._voicemailContext.close();
      }
      // Legacy cleanup for old implementation
      if (window._voicemailOscillator) {
        window._voicemailOscillator.stop();
      }
    });
  }
}