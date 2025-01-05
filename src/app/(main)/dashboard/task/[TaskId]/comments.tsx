import {
    createCommentOnTask,
    getCommentsOnTask,
} from "@/actions/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { MessageSquare, Send } from "lucide-react";
import React, { useEffect, useState } from 'react';


const TaskComments = ({ taskId }: { taskId: string }) => {
    const { user } = useUser();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [taskId]);

    const loadComments = async () => {
        try {
            const fetchedComments = await getCommentsOnTask(taskId);
            setComments(fetchedComments);
        } catch (error) {
            console.error("Failed to load comments:", error);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createCommentOnTask({
                taskId,
                text: newComment,
                authorId: user.id,
            });

            setNewComment("");
            await loadComments();
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    Comments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Comment Input */}
                <form onSubmit={handleSubmitComment} className="flex gap-4">
                    <div className="flex w-full gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={user?.imageUrl} />
                            <AvatarFallback>
                                {user?.firstName?.[0] || user?.username?.[0] || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="mb-2 min-h-[100px] resize-none"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="ml-auto"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={comment.author.imageUrl} />
                                <AvatarFallback>
                                    {comment.author.firstName?.[0] ||
                                        comment.author.username?.[0] || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {comment.author.firstName} {comment.author.lastName}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm">
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskComments;
