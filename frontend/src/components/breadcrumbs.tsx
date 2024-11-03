import { Breadcrumbs, Link } from '@mui/material';

// недопилено
export function GeneralBreadcrumbs() {
  const path: Array<string> = ('main' + window.location.pathname).split('/');
  const links: { main: string; 'it-utilization': string } = { main: '/', 'it-utilization': '/it-utilization/' };
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {path.map((part) => (
        <Link underline="hover" color="inherit" href={links[part as keyof typeof links]}>
          {part}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
