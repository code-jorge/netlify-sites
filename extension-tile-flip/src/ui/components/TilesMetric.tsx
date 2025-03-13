const TilesMetric = ({ 
  value, 
  max 
} : { 
  value: number, 
  max: number 
}) => (
  <div className="tw-meter tw-bg-gray-lightest tw-rounded-sm tw-block tw-relative tw-transition-all tw-duration-350 tw-pt-2 after:tw-text-gray after:tw-font-bold after:tw-absolute after:tw-top-3 after:tw-right-2 dark:tw-bg-gray-darkest tw-w-66">
    <div className="tw-absolute tw-inset-x-0 tw-top-0 tw-overflow-hidden tw-rounded-t-sm">
      <meter 
        value={value} 
        max={max}
        className="tw-block tw-h-2 tw-w-full tw-text-[8px] tw-bg-none tw-bg-gray-light tw-text-blue dark:tw-bg-gray-dark dark:tw-text-blue-lighter" 
      />
    </div>
    <dl className="tw-flex tw-flex-col tw-p-2">
      <div>
        <dt
          className="tw-m-0 tw-flex tw-w-full tw-min-w-full tw-flex-auto tw-items-center tw-gap-1 tw-text-sm tw-font-regular tw-leading-tight"
        >
          Tiles flipped
        </dt>
        <dd className="tw-leading-none tw-mt-1.5 tw-flex tw-items-end tw-gap-1 tw-text-xl">
          <span>
            <span>{value}</span>
            <span className="tw-text-gray-darker dark:tw-text-gray-light tw-text-base">
              <span className="tw-sr-only"> out of </span>
              <span
                className="tw-whitespace-nowrap before:tw-ml-0.5 before:tw-mr-px before:tw-content-['/']"
              >
                {max}
              </span>
            </span>
          </span>
        </dd>
      </div>
    </dl>
  </div>
)

export default TilesMetric