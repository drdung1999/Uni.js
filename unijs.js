let watchEffect;

class Uni {
  constructor(u_dom) {
    // vitual dom
    this.u_dom;
    this.root = document.getElementById("root");
  }

  mount(unode, parent_node) {
    // if(!parent_node) console.log(unode, parent_node);
    // Create element
    const el = (unode.el = document.createElement(unode.tag));
  
    // Set attributes for the element
    for(const attr in unode.attributes) {
      el.setAttribute(attr, unode.attributes[attr]);
    }
  
    // If children is string
    if(typeof unode.children === 'string') {
      el.textContent = unode.children;
    }
  
    // If children is array of children
    else {
      unode.children.forEach(function(child) {
        this.mount(child, el);
      }.bind(this));
    }
  
    parent_node.appendChild(el);
  }

  unmount(el) {
    el.parentNode.removeChild(el);
  }

  patch(new_unode, old_unode) {
    if(!old_unode) old_unode = this.u_dom;
    const el = (new_unode.el = old_unode.el);
  
    if(old_unode.tag !== new_unode.tag || JSON.stringify(old_unode.attributes) !== JSON.stringify(new_unode)) {
      this.mount(new_unode, el.parentNode);
      this.unmount(old_unode.el);
    }
  
    else {
      if(typeof new_unode.children === 'string') {
        el.textContent = new_unode.children;
      }
      else {
        const c1 = typeof old_unode.children === 'string' ? [] : old_unode.children;
        const c2 = new_unode.children;
        const common_length = Math.min(c1.length, c2.length);
        
        for (let i = 0; i < common_length; i++) {
          this.patch(c1[i], c2[i]);
        }
    
        if(c1.length > c2.length) {
          c1.slice(c2.length).forEach(child => {
            this.unmount(child);
          })
        }
    
        if(c1.length < c2.length) {
          c2.slice(c1.length).forEach(child => {
            this.mount(child, el);
          })
        }
      }
    }

    return new_unode;
  }

  render(u_dom) {
    this.u_dom = u_dom;
    this.mount(u_dom, this.root);
  }

  update() {
    let new_unode = this.patch(root());
    this.u_dom = new_unode;
  }

  JSX(tag, attributes, children) {
    return {
      tag,
      attributes,
      children
    }
  }
}

class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  depend(fn) {
    this.subscribers.add(fn);
  }

  notify() {
    this.subscribers.forEach(subscribe => subscribe());
  }
}

function reactive(obj) {
  const dep = new Dep();
  // watchEffect
  dep.depend(App.update.bind(App));

  for(key in obj) {
    let value = obj[key];

    Object.defineProperty(obj, key, {
      get() {
        return value;
      }, 

      set(new_value) {
        if(new_value !== value) {
          value = new_value;
          dep.notify();
        }
      }
    });
  }

  return obj;
}

const App = new Uni();
const JSX = App.JSX;

