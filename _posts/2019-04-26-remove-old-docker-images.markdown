---
layout: post
title:  "Removing Old Untagged Docker Images"
date:   2019-04-26
tags: docker
---

In Docker, it is easy to remove specific images with the command:

```bash
docker rmi <image_id>
```

If you check `docker images` one day and happen to notice a lot of images that need deleting, this can be a pain.  In particular, if you constantly build newer versions of tagged images on a regular basis, you may see that previous image will be untagged and listed as "\<none\>" in either the "tag" column, "repository" column, or both.  Fortunately, there is a quick way to remove these images:

```bash
docker rmi $(docker images | awk ' /<none>/ {print $3}')
```

First, in the subshell, the `docker images` command retrieves all image IDs.  This is then piped to 'awk' where the list is filtered by only those images that have the substring "\<none\>" in the line.  The 3rd field, which is the "image id" field from `docker images` is then returned as the input value for `docker rmi`.  Note this will only delete images that are not a dependency for another image.

Another way to do the same function is by running `docker rmi $(docker images -q -f dangling=true)`, which filters only untagged images, and returns just the image id to the `docker rmi` command.
