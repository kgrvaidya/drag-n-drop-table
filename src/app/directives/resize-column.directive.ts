import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[ResizeColumn]'
})
export class ResizeColumnDirective implements AfterViewInit{

  constructor(private el : ElementRef) { }

  ngAfterViewInit(): void {
    const cols:any[] = this.el.nativeElement.querySelectorAll('th');
    console.log(cols)

    const tableHeight = `${this.el.nativeElement.querySelector('th').offsetHeight}px`; //    '15px'; //`${this.el.nativeElement.offsetHeight}px`;

    cols.forEach((col:any) => {
      const resizer = document.createElement('div');
      resizer.classList.add('resizer');
  
      // Set the height
      resizer.style.height = tableHeight; // will be in px only
  
      // Add a resizer element to the column
      col.appendChild(resizer);
  
      // Will be implemented in the next section
      this.createResizableColumn(col, resizer);

    })

    
  }

  createResizableColumn = (col:any, resizer:any) => {
    // Track the current position of mouse
    let x = 0;
    let w = 0;

    const mouseDownHandler = (e:any) => {
      x = e.clientX;

      const styles = window.getComputedStyle(col);
      w = parseInt(styles.width, 10);

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);

      resizer.classList.add('resizing');
    };

    const mouseMoveHandler = (e:any) => {
        // Determine how far the mouse has been moved
        const dx = e.clientX - x;

        // Update the width of column
        col.style.width = `${w + dx}px`;
    };

    // When user releases the mouse, remove the existing event listeners
    const mouseUpHandler = () => {
      resizer.classList.remove('resizing');
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
};


}
