// app/components/Chat/ChatInput.jsx

import { useEffect, useRef, useState } from 'react';

import IconButton from '@/app/components/Buttons/IconButton';
import { makeThumbnailBase64 } from '@/app/components/Chat/chatFunctions/chatFunctions.js';
import IconCamera from '@/app/components/SVG/IconCamera';
// Import SVG icons
import IconPaperclip from '@/app/components/SVG/IconPaperclip';
import IconSend from '@/app/components/SVG/IconSend';
import IconSmiley from '@/app/components/SVG/IconSmiley';
import IconSoundRecord from '@/app/components/SVG/IconSoundRecord';
import { AppProvider } from '@/app/context/appProvider';
import {
  saveMessage,
  uploadFileToStorage,
} from '@/db/chatdb';

// Import CSS
import styles from './ChatInput.module.css';

// ChatInput component
export default function ChatInput({
  chatId,
  onMessageSent,
  editingMessage,
  onCancelEdit,
}) {
  const {
    chatData,
    setChatData,
    activeUser,
    setAutoScrollBot,
  } = AppProvider();

  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isTyping, setIsTyping] = useState(false);
  const textAreaRef = useRef(null);

  // Reset message when editingMessage changes
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    } else {
      setMessage('');
    }
  }, [editingMessage]);

  // Adjust textarea height when message content changes
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '2.9rem';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const resetTextareaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '2.9rem';
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (
        !message.trim() &&
        !isRecording &&
        !selectedFile
      ) {
        setIsSubmitting(false);
        return;
      }

      if (selectedFile) {
        const ts = Date.now();
        const cleanName = safeFilename(selectedFile.name);
        const path = `images/${chatId}-${ts}-${cleanName}`;

        const { publicUrl, error: uploadError } =
          await uploadFileToStorage(
            'chat-media',
            path,
            selectedFile
          );
        if (uploadError) {
          console.error('Upload failed:', uploadError);
          setIsSubmitting(false);
          return;
        }

        const thumbnailBase64 = imagePreview || null;

        const newMessage = {
          id: ts,
          content: publicUrl,
          type: selectedFile.type.startsWith('image/')
            ? 'image'
            : 'file',
          image_thumb: thumbnailBase64,
          user_uuid: activeUser.auth_id,
        };
        const { message: saved, error } = await saveMessage(
          chatId,
          newMessage,
          activeUser.auth_id
        );
        if (error) {
          console.error('Save failed:', error);
          setIsSubmitting(false);
          return;
        }

        // Remove manual message addition since we get it through subscription
        setSelectedFile(null);
        setImagePreview(null);
        setMessage('');
        resetTextareaHeight();
        setIsSubmitting(false);
        return;
      }
      if (editingMessage) {
        // Handle message edit
        onMessageSent(message);
        setMessage('');
        resetTextareaHeight();
        return;
      }

      // Handle new message
      const newMessage = {
        id: Date.now(),
        content: message,
        type: 'text',
        user_uuid: activeUser.auth_id,
      };

      const { error } = await saveMessage(
        chatId,
        newMessage,
        activeUser.auth_id
      );
      if (error) {
        console.error('Error saving message:', error);
        return;
      }

      setMessage('');
      resetTextareaHeight();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && editingMessage) {
      onCancelEdit();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default 'Enter' behavior (new line in input)
      if (message.trim() === '') return; // Prevent sending empty messages
      handleSubmit(e); // Trigger sending the message
    }
  };

  const startRecording = async () => {
    setAutoScrollBot(true);
    try {
      console.log('Starting recording process...');
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      console.log('Got media stream:', stream);

      // Check if the browser supports the codec
      const mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.error(
          'Browser does not support audio/webm;codecs=opus'
        );
        return;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      });
      console.log(
        'MediaRecorder created:',
        mediaRecorderRef.current
      );

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (
        event
      ) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log(
          'Recording stopped, chunks:',
          audioChunksRef.current.length
        );
        if (audioChunksRef.current.length === 0) {
          console.error('No audio data recorded');
          return;
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus',
        });
        console.log('Audio blob created:', audioBlob.size);

        // Use the correct bucket structure: chat-media/recordings
        const filePath = `recordings/${chatData.chatId}-${Date.now()}.webm`;
        console.log('Uploading to path:', filePath);

        const { publicUrl, error: uploadError } =
          await uploadFileToStorage(
            'chat-media',
            filePath,
            audioBlob,
            {
              contentType: 'audio/webm;codecs=opus',
              cacheControl: '3600',
            }
          );

        if (uploadError) {
          console.error(
            'Error uploading voice message:',
            uploadError
          );
          return;
        }
        console.log(
          'File uploaded successfully:',
          publicUrl
        );

        const newMessage = {
          id: Date.now(),
          content: publicUrl,
          type: 'recording',
          user_uuid: activeUser.auth_id,
          duration: recordingTime,
        };

        const { message: savedMessage, error } =
          await saveMessage(
            chatData.chatId,
            newMessage,
            activeUser.auth_id
          );
        if (error) {
          console.error(
            'Error saving voice message:',
            error
          );
          return;
        }
        console.log(
          'Message saved successfully:',
          savedMessage
        );

        setChatData((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            savedMessage,
          ],
        }));
      };

      // Start recording with 1 second timeslice
      mediaRecorderRef.current.start(1000);
      console.log('Recording started');
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error in recording process:', err);
    }
  };

  const stopRecording = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    }
  };

  const handleRecordingClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSmiley = () => {
    // Function to handle smiley
    console.log('Smiley clicked');
  };

  const handleTakePhoto = async () => {
    console.log('Take photo clicked');
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleBrowse = () => {
    // Function to handle smiley
    fileInputRef.current?.click();
    console.log('Browse clicked');
  };

  const safeFilename = (name, maxLength = 20) => {
    const base = name.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // ta bort konstiga tecken
    const parts = base.split('.');
    const ext = parts.pop();
    const filename = parts.join('_').slice(0, maxLength);
    return `${filename}.${ext}`;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any existing file selection first
    clearImagePreview();

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const thumb = await makeThumbnailBase64(file);
      setImagePreview(thumb);

      // If the file came from the camera input on mobile, auto-send it
      if (
        e.target === cameraInputRef.current &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        handleSubmit();
      }
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current)
      fileInputRef.current.value = '';
    if (cameraInputRef.current)
      cameraInputRef.current.value = '';
  };

  const handleInputChange = (e) => {
    console.log('Input value:', e.target.value);
    const newValue = e.target.value;
    if (newValue.length > 1000) return;
    setMessage(newValue);
    // Auto-expand the textarea height based on content
    textAreaRef.current.style.height = '2.9rem'; // Reset height to auto before adjusting
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set the height to scrollHeight
  };

  // MARK: Markup
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div
        className={styles.inputContainer}
        style={{
          border: '1px solid #000',
          borderRadius: '5px',
        }}
      >
        {imagePreview && (
          <div className={styles.imagePreviewContainer}>
            <img
              src={imagePreview}
              alt="Preview"
              className={styles.imagePreview}
            />
            <button
              type="button"
              onClick={clearImagePreview}
              className={styles.clearPreview}
            >
              ×
            </button>
          </div>
        )}
        <div className={styles.chatInput}>
          <div className={styles.chatInputContent}>
            <div className={styles.chatInputContainer}>
              {editingMessage && (
                <div
                  className={
                    styles.cancelEditButtonContainer
                  }
                >
                  <button
                    type="button"
                    className={styles.cancelEditButton}
                    onClick={onCancelEdit}
                    title="Cancel editing"
                  >
                    ×
                  </button>
                  Cancel edit
                </div>
              )}
              <textarea
                ref={textAreaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  editingMessage
                    ? 'Edit your message...'
                    : 'Type a message...'
                }
                className={styles.textarea}
                rows={1}
                disabled={!!imagePreview || !!isRecording}
              />

              <input
                type="file"
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <IconButton
                className={styles.iconBrowseButton}
                icon={
                  <IconPaperclip
                    className={styles.iconBrowse}
                  />
                }
                onClick={handleBrowse}
              />
              <IconButton
                className={styles.iconTakePhotoButton}
                icon={
                  <IconCamera
                    className={styles.iconTakePhoto}
                  />
                }
                onClick={handleTakePhoto}
              />
              <IconButton
                className={styles.iconSmileyButton}
                icon={
                  <IconSmiley
                    className={styles.iconSmiley}
                  />
                }
                onClick={handleSmiley}
              />
            </div>
            {!message.trim() && !imagePreview ? (
              !isRecording || !selectedFile ? (
                <IconButton
                  className={`${styles.iconRounded} ${styles.iconRecordSound} ${isRecording ? styles.recording : ''}`}
                  icon={<IconSoundRecord />}
                  onClick={handleRecordingClick}
                />
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    stopRecording(e);
                  }}
                  className={styles.recordingButton}
                >
                  {formatTime(recordingTime)}
                </button>
              )
            ) : (
              <IconButton
                className={`${styles.iconRounded} ${styles.iconSendButton}`}
                icon={
                  <IconSend className={styles.iconSend} />
                }
                onClick={(e) => handleSubmit(e)}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
