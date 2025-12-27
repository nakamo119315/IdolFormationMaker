import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

interface SkeletonCircleProps {
  size?: string;
  className?: string;
}

export function SkeletonCircle({ size = '40px', className = '' }: SkeletonCircleProps) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      className={className}
    />
  );
}

interface SkeletonTableRowProps {
  columns?: number;
  showCheckbox?: boolean;
  showImage?: boolean;
}

export function SkeletonTableRow({ columns = 5, showCheckbox = false, showImage = false }: SkeletonTableRowProps) {
  return (
    <tr className="skeleton-table-row">
      {showCheckbox && (
        <td className="checkbox-col">
          <Skeleton width="18px" height="18px" borderRadius="4px" />
        </td>
      )}
      {showImage && (
        <td>
          <Skeleton width="48px" height="48px" borderRadius="8px" />
        </td>
      )}
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <Skeleton height="1rem" width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
  showImage?: boolean;
}

export function SkeletonTable({ rows = 10, columns = 5, showCheckbox = false, showImage = false }: SkeletonTableProps) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} showCheckbox={showCheckbox} showImage={showImage} />
      ))}
    </tbody>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton height="200px" borderRadius="8px 8px 0 0" />
      <div className="skeleton-card-content">
        <Skeleton height="1.25rem" width="70%" />
        <Skeleton height="1rem" width="50%" />
      </div>
    </div>
  );
}
