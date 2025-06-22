'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { useToast } from '@/components/ui/use-toast'

export default function BlogPostsPage() {
  const [blogPosts, setBlogPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPost, setEditingPost] = useState(null)
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'DRAFT',
    category: 'NEWS'
  })
  const { toast } = useToast()

  const fetchBlogPosts = useCallback(async () => {
    try {
      const posts = await prisma.blogPost.findMany()
      setBlogPosts(posts)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBlogPosts()
  }, [fetchBlogPosts])

  const handleCreatePost = async () => {
    try {
      await prisma.blogPost.create({
        data: newPost
      })
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      })
      setNewPost({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        status: 'DRAFT',
        category: 'NEWS'
      })
      fetchBlogPosts()
    } catch (error) {
      console.error('Error creating blog post:', error)
      toast({
        title: 'Error',
        description: 'Failed to create blog post',
        variant: 'destructive',
      })
    }
  }

  const handleUpdatePost = async (id: string, data: any) => {
    try {
      await prisma.blogPost.update({
        where: { id },
        data
      })
      toast({
        title: 'Success',
        description: 'Blog post updated successfully',
      })
      setEditingPost(null)
      fetchBlogPosts()
    } catch (error) {
      console.error('Error updating blog post:', error)
      toast({
        title: 'Error',
        description: 'Failed to update blog post',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePost = async (id: string) => {
    try {
      await prisma.blogPost.delete({
        where: { id }
      })
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      })
      fetchBlogPosts()
    } catch (error) {
      console.error('Error deleting blog post:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      })
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => {
                  setNewPost({
                    ...newPost,
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  })
                }}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={newPost.slug}
                onChange={(e) =>
                  setNewPost({ ...newPost, slug: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={newPost.excerpt}
                onChange={(e) =>
                  setNewPost({ ...newPost, excerpt: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="featuredImage">Featured Image</Label>
              <Input
                id="featuredImage"
                value={newPost.featuredImage}
                onChange={(e) =>
                  setNewPost({ ...newPost, featuredImage: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={newPost.metaTitle}
                onChange={(e) =>
                  setNewPost({ ...newPost, metaTitle: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={newPost.metaDescription}
                onChange={(e) =>
                  setNewPost({ ...newPost, metaDescription: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Textarea
                id="metaKeywords"
                value={newPost.metaKeywords}
                onChange={(e) =>
                  setNewPost({ ...newPost, metaKeywords: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={newPost.status} onValueChange={(value) =>
                setNewPost({ ...newPost, status: value })
              }>
                <Select.Trigger>
                  <Select.Value placeholder="Select status" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="DRAFT">Draft</Select.Item>
                  <Select.Item value="PUBLISHED">Published</Select.Item>
                  <Select.Item value="ARCHIVED">Archived</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={newPost.category} onValueChange={(value) =>
                setNewPost({ ...newPost, category: value })
              }>
                <Select.Trigger>
                  <Select.Value placeholder="Select category" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="NEWS">News</Select.Item>
                  <Select.Item value="TRENDS">Trends</Select.Item>
                  <Select.Item value="REVIEWS">Reviews</Select.Item>
                  <Select.Item value="HOW_TO">How To</Select.Item>
                  <Select.Item value="STYLE_GUIDE">Style Guide</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <Button type="button" onClick={handleCreatePost}>
              Create Post
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>Slug: {post.slug}</p>
                        <p>Status: {post.status}</p>
                        <p>Category: {post.category}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditingPost(post)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
