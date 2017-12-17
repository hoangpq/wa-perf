<script>

const Selected = {
  props: {
    render: {
      default: h => null,
    }
  },
  data() {
    return {
      selected: 0,
    }
  },
  methods: {
    select(index) {
      this.selected = index;
    }   
  },
  render() {
    return this.$props.render({ 
      selected: this.selected, 
      select: this.select 
    });
  },
}

const CatsList = {
  functional: true,
  render: (h, { props }) => {
    return (
      <div class="lists">
        <span>Selectd: {props.selected}</span>
        <article>
        {
          props.names
            .slice(0, props.limit)
            .map(name => `https://robohash.org/${name}?set=set4`)
            .map((url, i) => {
              const klass = i === props.selected ? 'item-selected' : '';
              return <img class={klass} 
                          src={url} 
                          style={{width: 200, height: 200}} 
                          onClick={event => props.select(i)} />;
            })
        }
        </article>
      </div>
    )
  }
}

export default {
  functional: true,
  render: (h, { props }) => {
    return (
      <div>
        <Selected render={
          ({ selected, select }) => 
            <CatsList names={props.names} 
                      limit={props.limit}  
                      selected={selected}  
                      select={select} />} 
        />
      </div>
    )
  }
}
</script>
