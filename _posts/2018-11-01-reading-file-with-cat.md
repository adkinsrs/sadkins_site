---
layout: post
title:  "Why reading in a file with cat is wrong"
date:   2018-11-01
categories: shell unix bash
---

It has been quite a long time since I have posted to my blog.  I have been wanting to add more things, but honestly, the passion and ideas for content have not been there.  This is much the same reason I decided not to do National Novel Writing Month (NaNoWriMo) this year, despite having an idea for a book I like.  But in it's place, I've decided to try and write a blog post a day for the month of November (or at least when I can).

For this one, I am going to highlight a shell scripting habit I have done, which I only discovered recently is not the correct way to do this.... reading in files with the "cat" utility.  If I wrote a "for" loop to loop through a file with a list of names, the "cat" program behaves innocently enough.
```bash
#!/bin/bash
echo -e "file1\nfile2\nfile3" > test.txt

for f in `cat test.txt
do
	echo $f
done
```
```
file1
file2
file3
```

However suppose we want to cat a file with spaces or tabs, such as an md5-checksum file.  The behavior is not what you expect.
```bash
#!/bin/bash
md5sum file1 > test.txt	### b3a30e00413ee10a67c9885e82cb41fd	file1
md5sum file2 >> test.txt	### 994fa7365446cc14fec9f2a22426f28c	file2
md5sum file3 >> test.txt	### 6c31005bdd028d524c73f7a35d658a88	file3
for f in `cat test.txt`
do
    echo "string = $f"
    s=$(echo $f | cut -f1)
    t=$(echo $f | cut -f2)
    echo "s = $s"
    echo "t = $t"
done
```
```
string = b3a30e00413ee10a67c9885e82cb41fd
s = b3a30e00413ee10a67c9885e82cb41fd
t = b3a30e00413ee10a67c9885e82cb41fd
string = file1
s = file1
t = file1
string = 994fa7365446cc14fec9f2a22426f28c
s = 994fa7365446cc14fec9f2a22426f28c
t = 994fa7365446cc14fec9f2a22426f28c
string = file2
s = file2
t = file2
string = 6c31005bdd028d524c73f7a35d658a88
s = 6c31005bdd028d524c73f7a35d658a88
t = 6c31005bdd028d524c73f7a35d658a88
string = file3
s = file3
t = file3
```

As you can see, "cat" splits on any whitespace, not just the newline character.  As a result, my "cat" command in the for-loop executes 6 times instead of 3, and the results of the "cut" commands within are also not correct.

How do we fix this?  By using a "while read line" loop instead:
```bash
#!/bin/bash
while read f
do
    echo "string = $f"
    s=$(echo $f | cut -f1)
    t=$(echo $f | cut -f2)
    echo "s = $s"
    echo "t = $t"
done < "test.txt"
```
Do note the file is being redirected as STDIN at the end of the loop
```
string = b3a30e00413ee10a67c9885e82cb41fd    file1
s = b3a30e00413ee10a67c9885e82cb41fd
t = file1
string = 994fa7365446cc14fec9f2a22426f28c    file2
s = 994fa7365446cc14fec9f2a22426f28c
t = file2
string = 6c31005bdd028d524c73f7a35d658a88    file3
s = 6c31005bdd028d524c73f7a35d658a88
t = file3
```

There!  Hopefully this is a reminder to myself not to make this silly mistake again when processing files in a loop, and hopefully someone else ends up finding this useful as well.
