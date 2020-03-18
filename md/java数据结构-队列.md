---
title: 数据结构-队列
date: 2020-03-17 01:14:2ß7
categories:
  - 数据结构
tags:
  - 数据结构
---

数据结构-队列，介绍队列的数据结构。
<!-- more -->

------------
### 概念
**队列(queue)是只允许在一端进行插入操作，而在另一端进行删除操作的线性表。**

**队列是一种先进先出(First In First Out)的线性表，简称FIFO。允许插入的一端称为队尾，允许删除的一端称为队头。**

我们知道，栈支持两个基本操作：入栈push()和出栈pop()。队列和栈非常相似，基本的操作也是两个：**入队enqueue()**,放一个数据到队列尾部；**出队dequeue()**，从队列头部取一个元素。

<img class="avatar" src="/img/queue.jpg">

作为一种非常基础的数据结构，队列的应用也非常广泛，特别是一些具有某些额外特性的队列，比如**循环队列**、**阻塞队列**、**并发队列**。它们在很多偏低层系统、框架、中间件的开发中，起着关键性的作用。比如高性能队列Disruptor、Linux环形缓存，都用到了循环并发队列；Java concurrent并发包利用ArrayBlockingQueue来实现公平锁等。

### 顺序队列和链式队列

队列可与你用数组来实现，也可以用链表来实现。用数组实现的栈叫顺序栈，用链表实现的栈叫做链式栈。同样，用数组实现的队列叫做 **顺序队列**，用链表实现的队列，叫做 **链式队列**。

#### 顺序队列

顺序队列基于数组实现，代码实现：

```java

// 用数组实现的队列
public class ArrayQueue {
  // 数组：items，数组大小：n
  private String[] items;
  private int n = 0;
  // head表示队头下标，tail表示队尾下标
  private int head = 0;
  private int tail = 0;

  // 申请一个大小为capacity的数组
  public ArrayQueue(int capacity) {
    items = new String[capacity];
    n = capacity;
  }

  // 入队
  public boolean enqueue(String item) {
    // 如果tail == n 表示队列已经满了
    if (tail == n) return false;
    items[tail] = item;
    ++tail;
    return true;
  }

  // 出队
  public String dequeue() {
    // 如果head == tail 表示队列为空
    if (head == tail) return null;
    // 为了让其他语言的同学看的更加明确，把--操作放到单独一行来写了
    String ret = items[head];
    ++head;
    return ret;
  }
}
```

对于栈来说，我们只需要一个 **栈顶指针** 就可以了，但是队列需要两个指针：一个head指针，指向队头，一个tail指针，指向队尾。

随着不停的进行入队，出队操作，head和tail都会持续往后移动。当tail移动到最右边，即使数组中还有空闲空间，也无法继续往队列中添加数据了。如何解决这个问题呢？

可以用数据搬移，每次进出队操作都相当于删除数组下标为0的数据，要搬移整个队列中的数据，这样出队操作的时间复杂度就会从原来的O(1)变为O(n),能不能优化一下呢？

我们出队时，可以不用搬移数据，如果没有空闲时间了，我们只需要在入队时，集中出发一次数据的搬移操作。出队函数dequeue()保持不变，改造一下入队enqueue()的实现：

```java

   // 入队操作，将item放入队尾
  public boolean enqueue(String item) {
    // tail == n表示队列末尾没有空间了
    if (tail == n) {
      // tail ==n && head==0，表示整个队列都占满了
      if (head == 0) return false;
      // 数据搬移
      for (int i = head; i < tail; ++i) {
        items[i-head] = items[i];
      }
      // 搬移完之后重新更新head和tail
      tail -= head;
      head = 0;
    }
    
    items[tail] = item;
    ++tail;
    return true;
  }
```

当队列的tail指针移动到数组的最右边后，如果有闲的数据入队时，可以将head到tail之前的数据，整理搬移到0到tail-head的位置。这样的实现，出队的操作时间复杂度仍然为O(1),但是入队的时间复杂度仍是O(1)。

#### 链式队列

基于链表的实现，我们同样需要两个指针：head指针和tail指针。他们呢分别指向链表的第一个结点和队后一个结点。入队时，tail->next= new_node, tail = tail->next；出队时，head = head->next。

<img class="avatar" src="/img/linkedqueue.jpg">

### 循环队列

用数组来实现队列的时候，在tail==n时，会有数据搬移操作，这样入队操作性能就会受到影响。我们可以用循环队列解决。

我们把队列这种头尾相接的顺序的存储结构称为循环队列。在循环队列中，当tail==n时，不吧tail指向n+1，而是将tail指向0，tail+1更新为1。

通过这样的操作就成功避免了数据搬移操作。队满时的条件为：(tail+1)%n=head.代码实现：

```java

public class CircularQueue {
  // 数组：items，数组大小：n
  private String[] items;
  private int n = 0;
  // head表示队头下标，tail表示队尾下标
  private int head = 0;
  private int tail = 0;

  // 申请一个大小为capacity的数组
  public CircularQueue(int capacity) {
    items = new String[capacity];
    n = capacity;
  }

  // 入队
  public boolean enqueue(String item) {
    // 队列满了
    if ((tail + 1) % n == head) return false;
    items[tail] = item;
    tail = (tail + 1) % n;
    return true;
  }

  // 出队
  public String dequeue() {
    // 如果head == tail 表示队列为空
    if (head == tail) return null;
    String ret = items[head];
    head = (head + 1) % n;
    return ret;
  }
}
```

### 阻塞队列和并发队列

#### 阻塞队列

阻塞队列其实就是在队列基础上增加了阻塞操作。简单来说，就是在队列为空的时候，从队头取数据就会被阻塞。因为此时还没有数据可取，直到队列中有了数据才能返回。如果队列已经满了，那么插入数据的操作就会被阻塞，直到队列中有空闲位置后，在插入数据，然后在返回。

阻塞队列的定义就是一个“生产者-消费者模型”，我们可以使用阻塞队列，轻松实现一个“生产者-消费者模型”。

基于阻塞队列实现的“生产者-消费者模型”，可以有效的协调生产和消费的速度。当生产者生成的数据速度过快，消费者来不及消费时，存储数据的队列很快就会满了，这个时候生产者就阻塞等待，知道消费者消费了数据，生产才会被唤醒继续生产。

#### 并发队列

在多线程的情况下，会有多个线程同时操作队列，这个时候就会存在线程安全问题，如何实现一个线程安全的队列呢？

线程安全的队列我们叫做 **并发队列** 。最简单的方式是，直接在enqueue()、dequeue()方法上加锁但是锁粒度大而并发 度会比较低，同一时刻仅允许一个存或取操作。

实际上，基于数组的循环队列，利用CAS原子操作，可以实现非常搞笑的并发队列，这也是循环队列比链式队列应用更广泛的原因。

### 应用

线程池没有空闲线程时，新的任务请求线程资源时，线程池该如何处理？

我们一般有两种处理策略：一是非阻塞的处理方式，直接拒绝任务请求；二是阻塞的处理方式，将请求排队，等到有空闲线程时，去除排队的请求继续处理。如何存储排队的请求呢？

我们希望公平的处理每个排队的请求，先进先出原则，所有队列这种数据结构，很适合来存储排队请求。

基于链表实现无界队列，但kennel导致过多的请求排队，请求处理的响应时间过长。所以针对响应时间敏感的系统，链表时间的无界队列是不合适的。

基于数组实现的有界队列，队列大小有限，所以线程池中排队的请求超过队列大小时，接下来的请求将会被拒绝，这种方式更合理，设置一个合理的队列大小，可以重复利用资源，发挥最大性能。

实际上，对于大部分资源有限的场景，当没有空闲资源时，基本上都可以通过“队列”这种数据结构来实现请求排队。