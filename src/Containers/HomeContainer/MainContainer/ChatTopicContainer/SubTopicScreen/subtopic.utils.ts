
export interface StackData {
  title:string
  parentId:string
}

class Stack {
  constructor(data: StackData) {
    this.data = data;
    this.next = null;
  }
}

export class HistoryStack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  // Push a new item onto the stack
  push(item:StackData) {
    const newNode = new Stack(item);
    newNode.next = this.top;
    this.top = newNode;
    this.size++;
  }

  // Pop the last item from the stack
  pop() {
    if (!this.top) return null;

    const poppedItem = this.top.data as StackData
    this.top = this.top.next;
    this.size--;
    return poppedItem;
  }

  // Get the size of the stack
  getSize() {
    return this.size as number
  }

  // Check if the stack is empty
  isEmpty() {
    return this.size === 0;
  }

  // Retrieve the entire stack
  getStack() {
    const stackArray = [];
    let current = this.top;
    while (current) {
      stackArray.push(current.data);
      current = current.next;
    }
    return stackArray as StackData[]
  }
}
