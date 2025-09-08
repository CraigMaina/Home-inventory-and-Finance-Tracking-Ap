import React, { useState } from 'react';
import Card from './Card';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import type { Announcement } from '../types';
import { mockAnnouncements } from '../constants';
import { TrashIcon } from '../icons/IconComponents';

const formatTimeAgo = (isoString: string) => {
    const now = new Date();
    const past = new Date(isoString);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        return years === 1 ? "1 year ago" : `${years} years ago`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        const months = Math.floor(interval);
        return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        return days === 1 ? "1 day ago" : `${days} days ago`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }
    if (seconds < 10) return "just now";
    return Math.floor(seconds) + " seconds ago";
};


const Announcements: React.FC = () => {
    const { user } = useAuth();
    const canPost = user.role === Role.Admin || user.role === Role.Editor;

    const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    const [newContent, setNewContent] = useState('');
    const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewMediaFile(file);
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
            }
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContent.trim() && !newMediaFile) {
            alert('Please add content or media to your announcement.');
            return;
        }

        const newAnnouncement: Announcement = {
            announcementId: `a${Date.now()}`,
            authorId: user.userId,
            authorName: user.name,
            authorAvatarUrl: user.avatarUrl,
            content: newContent,
            timestamp: new Date().toISOString(),
        };

        if (newMediaFile && mediaPreview) {
            newAnnouncement.mediaUrl = mediaPreview;
            newAnnouncement.mediaType = newMediaFile.type.startsWith('image/') ? 'image' : 'video';
        }

        setAnnouncements(prev => [newAnnouncement, ...prev]);

        setNewContent('');
        setNewMediaFile(null);
        setMediaPreview(null);
        // Clean up the object URL after we're done with the file reference
        if (mediaPreview) {
             URL.revokeObjectURL(mediaPreview);
        }
    };

    const removeMedia = () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview);
        }
        setNewMediaFile(null);
        setMediaPreview(null);
    }

    const handleDeletePost = () => {
        if (!announcementToDelete) return;
        setAnnouncements(prev => prev.filter(a => a.announcementId !== announcementToDelete.announcementId));
        setAnnouncementToDelete(null);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Announcements</h1>

            {canPost && (
                <Card>
                    <form onSubmit={handlePost}>
                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            rows={3}
                            placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
                        />
                        {mediaPreview && (
                            <div className="mt-4 relative group">
                                {newMediaFile?.type.startsWith('image/') ? (
                                    <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-lg" />
                                ) : (
                                    <video src={mediaPreview} controls className="max-h-64 rounded-lg w-full" />
                                )}
                                <button type="button" onClick={removeMedia} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-4">
                            <label htmlFor="media-upload" className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Add Photo/Video
                                <input type="file" id="media-upload" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                            </label>
                            <button
                                type="submit"
                                disabled={!newContent.trim() && !newMediaFile}
                                className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-500"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-6">
                {announcements.map(announcement => {
                    const canDelete = user.role === Role.Admin || user.userId === announcement.authorId;
                    return (
                        <Card key={announcement.announcementId}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <img src={announcement.authorAvatarUrl} alt={announcement.authorName} className="w-10 h-10 rounded-full object-cover mr-4" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{announcement.authorName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(announcement.timestamp)}</p>
                                    </div>
                                </div>
                                {canDelete && (
                                    <button 
                                        onClick={() => setAnnouncementToDelete(announcement)}
                                        className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                                        aria-label="Delete post"
                                    >
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                            {announcement.content && (
                                <p className="text-slate-700 whitespace-pre-wrap dark:text-slate-300">{announcement.content}</p>
                            )}
                            {announcement.mediaUrl && (
                                <div className="mt-4">
                                    {announcement.mediaType === 'image' ? (
                                        <img src={announcement.mediaUrl} alt="Announcement media" className="max-h-96 rounded-lg w-full object-contain bg-slate-100 dark:bg-slate-900" />
                                    ) : (
                                        <video src={announcement.mediaUrl} controls className="max-h-96 rounded-lg w-full" />
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            <Modal isOpen={!!announcementToDelete} onClose={() => setAnnouncementToDelete(null)} title="Confirm Deletion">
                <div className="mt-4">
                    <p className="text-slate-600 dark:text-slate-400">Are you sure you want to delete this announcement? This action cannot be undone.</p>
                    <div className="pt-6 flex justify-end gap-2">
                        <button type="button" onClick={() => setAnnouncementToDelete(null)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button onClick={handleDeletePost} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-500">
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Announcements;