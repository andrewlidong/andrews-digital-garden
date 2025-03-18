# RC Webring Implementation

This site is a proud member of the [Recurse Center Webring](https://ring.recurse.com).

## Implementation

The webring is implemented using a simple image link in the bottom right corner of the site:

```html
<a href="https://ring.recurse.com" target="_blank" rel="noopener noreferrer">
  <img 
    src="/rc-webring.gif" 
    alt="Recurse Center Webring" 
    class="w-12 h-12 rounded-full hover:scale-110 transition-transform duration-200"
  />
</a>
```

## Navigation

The webring allows visitors to:
- Navigate to the next site in the ring
- Navigate to the previous site in the ring
- View all sites in the ring
- Learn more about the Recurse Center

## About RC

The [Recurse Center](https://www.recurse.com/) is a self-directed, community-driven educational retreat for programmers in New York City. 