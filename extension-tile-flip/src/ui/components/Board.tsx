const Board = ({ 
  board, 
  onClick 
}: { 
  board: boolean[][], 
  onClick: (rowIndex: number, colIndex: number)=> void 
 })=> (
  <div className="tw-flex tw-items-center tw-justify-center tw-p-4">
    <div className="tw-bg-white/10 tw-backdrop-blur-lg tw-p-8 tw-rounded-xl tw-shadow-2xl">
      <div className="tw-grid tw-grid-cols-5 tw-gap-4">
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onClick(rowIndex, colIndex)}
              className="tw-w-20 tw-h-20 tw-perspective-1000 tw-transform-gpu tw-transition-transform tw-duration-700 tw-cursor-pointer tw-group"
            >
              <div
                className={`tw-relative tw-w-full tw-h-full tw-transition-all tw-duration-700 tw-transform-gpu tw-transform-3d ${
                  tile ? 'tw-rotate-y-180' : ''
                }`}
              >
                <div className="tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-bg-gray tw-rounded-lg tw-shadow-md tw-backface-hidden">
                  <svg className='tw-size-9' viewBox="0 0 128 128">
                    <path fill="rgba(12, 42, 42, .5)" d="m125.2 54.8-52-52L71.3.9 69.2 0H58.8l-2.1.9-1.9 1.9-52 52-1.9 1.9-.9 2.1v10.3l.9 2.1 1.9 1.9 52 52 1.9 1.9 2.1.9h10.3l2.1-.9 1.9-1.9 52-52 1.9-1.9.9-2.1V58.8l-.9-2.1-1.8-1.9z" />
                  </svg>
                </div>
                <div className="tw-absolute tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-bg-teal tw-rounded-lg tw-shadow-md tw-backface-hidden tw-rotate-y-180">
                  <svg className='tw-size-9' viewBox="0 0 128 128">
                    <path fill="rgb(12, 42, 42)" d="m125.2 54.8-52-52L71.3.9 69.2 0H58.8l-2.1.9-1.9 1.9-52 52-1.9 1.9-.9 2.1v10.3l.9 2.1 1.9 1.9 52 52 1.9 1.9 2.1.9h10.3l2.1-.9 1.9-1.9 52-52 1.9-1.9.9-2.1V58.8l-.9-2.1-1.8-1.9z" />
                    <path fill="white" d="M78.9 80.5H71l-.7-.7V61.3c0-3.3-1.3-5.9-5.3-6-2-.1-4.4 0-6.9.1l-.4.4v24l-.7.7h-7.9l-.7-.7V48.1l.7-.7H67c6.9 0 12.6 5.6 12.6 12.6v19.8l-.7.7z" />
                    <path fill="rgb(50, 230, 226)" d="m38.4 30.8 7.3 7.3v5.8l-.8.8h-5.8l-7.3-7.3v-1.1l5.5-5.5h1.1zm.2 37.2v-8l-.7-.7h-28l-.7.7v8l.7.7H38l.6-.7zm.5 15.7L31.8 91v1.1l5.5 5.5h1.1l7.3-7.3v-5.8l-.8-.8h-5.8zM60 11.3l-.6.7v25l.7.7H68l.7-.7V12l-.7-.7h-8zm0 79.1-.7.7v25l.7.7h8l.7-.7v-25l-.7-.7h-8zm58.1-31h-28l-.7.6v8l.7.7h28.1l.7-.7v-8l-.8-.6z" />
                  </svg>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
)

export default Board