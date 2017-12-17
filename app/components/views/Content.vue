<script>
export default {
  functional: true,
  render: (h, { children, props }) => {
    return (
      <article>
      {
        children
          .filter(node => node.tag).
          slice(0, props.limit)
      }
      </article>
    )
  }
}
</script>
