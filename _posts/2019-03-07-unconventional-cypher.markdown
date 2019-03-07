---
layout: post
title:  "Unconventional Properties in Neo4j"
date:   2019-03-07
categories: neo4j cypher python
---

In neo4j, property keys have certain restrictions when naming the key.  The key names must only be in alphanumeric or underscore characters.  But what if for some reason, you wish to use other characters in your key names?  All is not lost!

(apologies in advance for the lack of code syntax, as I believe Cypher is not supported in Markdown)

Instead of creating a node like this...

**CREATE (n:Person { first\_name: "John", last\_name: "Doe} )**

... you can use backticks to name the property however you wish

**CREATE (n:Person { `name.first`: "John", `name.last`: "Doe} )**

To retrieve a property that was created with backticks, just re-apply the backticks during the query

**MATCH (n:Person) WHERE n.`name.first` = "John" RETURN n**
**MATCH (n:Person) WHERE n.`first\_name` = "John" RETURN n**

Note I went ahead and escaped the property key from the first example with backticks also just to prove that you can use backticks for any property... not just the ones with odd names.  Having said all this, it is worth reiterating that this goes against Neo4j's standard naming rules and conventions (link at bottom of page), and thus it is wise to carefully consider if using escaped names is truly what is best for your project.

If you are using the Python module py2neo to handle Neo4j tasks, then you can use the cypher\_escape("string") function to escape the string properly so that Neo4j won't complain when it's passed as a label or a property key or else.
Now why would we ever want to create property keys with unconventional characters?  One reason would be to preserve a hierarchical structure.  Since Neo4j does not allow for nested properties (to my knowledge), one would have to flatten the hierarchy first, such as that from a JSON file, before importing it.  In the second CREATE example above, I created a sort-of hierarchy with the "name" key and added "first" and "last" as sub-keys within.  A second, and sort-of related reason to use unconventional naming conventions is to minimize change in property key names across services.  If Neo4j serves as an intermediate between two services of a stack, and the outer services use a naming convention that Neo4j doesn't like, it may be less of a pain to conform Neo4j to those rules, rather than conforming the outer services to Neo4j's rules.

Link to the Neo4j naming rules -> https://neo4j.com/docs/cypher-manual/current/syntax/naming/

